import {
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Constant } from 'src/constants/constant';
import { QueuePrometheusService } from './queue-prometheus.service';
import { RrdSsh } from 'src/utils/ssh/rrd.ssh';
import { HttpService } from '@nestjs/axios';
import { Axios } from 'axios';

export enum QueuePrometheusProcessType {
    INSTALL = 'INSTALL',
    UPDATE = 'UPDATE',
    UNINSTALL = 'UNINSTALL',
}

/** JOB ID is RRD ID */
@Processor(Constant.Q_PROMETHEUS_CONFIG_RRD)
export class QueuePrometheusProcess {
    private readonly axios: Axios;
    constructor(
        private readonly queuePrometheusService: QueuePrometheusService,
        private readonly httpService: HttpService,
    ) {
        this.axios = this.httpService.axiosRef;
    }

    @Process(QueuePrometheusProcessType.INSTALL)
    async processInstall(job: Job) {}

    @Process(QueuePrometheusProcessType.UPDATE)
    async processUpdate(job: Job) {
        const rrd = await this.queuePrometheusService.getRrdConfigData(
            Number(job.id),
        );

        const configs: { filename: string; content: string }[] = [];
        const rtuIds: number[] = [];
        if (rrd.rtus.length > 0) {
            rrd.rtus.forEach((rtu) => {
                rtuIds.push(rtu.id);
                const config = this.queuePrometheusService.generateConfig(rtu);
                configs.push(config);
            });
            await RrdSsh.generateAlertConfigs({
                ip_address: rrd.ip_address,
                configs,
            });
            
            await this.axios.post(`http://${rrd.ip_address}:8000/-/reload`);
    
            await this.queuePrometheusService.updateRtuLastUpdatedConfig(rtuIds);
            console.log('Success restart RRD', rrd.ip_address);
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
