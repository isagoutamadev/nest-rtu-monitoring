import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Constant } from 'src/constants/constant';
import { MdService } from 'src/resources/parameter/md/md.service';
import { QueueTelegrafService } from './queue-telegraf.service';
import { MdSsh } from 'src/utils/ssh/md.ssh';

export enum QueueTelegrafProcessType {
    INSTALL = 'INSTALL',
    UPDATE = 'UPDATE',
    UNINSTALL = 'UNINSTALL' 
}

/** JOB ID is MD ID */
@Processor(Constant.Q_TELEGRAF_CONFIG_MD)
export class QueueTelegrafProcess {
    constructor(private readonly mdService: MdService, private readonly queueTelegrafService: QueueTelegrafService) {}

    @Process({concurrency: 1, name: QueueTelegrafProcessType.INSTALL})
    async processInstall(job: Job) {
        
    }
    
    @Process({concurrency: 1, name: QueueTelegrafProcessType.UPDATE})
    async processUpdate(job: Job) {
        const md = await this.mdService.configFindById(Number(job.id), {
            isConfigTelegraf: true,
        });
        const configs: {filename: string, content: string}[] = [];
        const rtuIds: number[] = [];
        md.telegraf_rtus.forEach(rtu => {
            rtuIds.push(rtu.id);
            configs.push(this.queueTelegrafService.generateConfig(rtu));
        });
        if (configs.length > 0) {
            await MdSsh.generateRtuTelegrafConfigs({
                ip_address: md.ip_address,
                is_virtual: md.is_virtual,
                sname: md.sname,
                configs: configs
            });

            await this.queueTelegrafService.updateRtuLastUpdatedConfig(rtuIds);
        }
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        await job.remove();
    }

    @OnQueueFailed()
    async onFailed(job: Job) {
        console.log(job.stacktrace);
        await job.remove();
    }
}
