import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Constant } from 'src/constants/constant';
import { Md } from 'src/resources/parameter/md/entities/md.entity';
import { QueueTelegrafProcessType } from './queue-telegraf.process';
import { RtuTelegrafConfigData } from 'src/resources/parameter/rtu/entities/rtu.entity';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { Knex } from 'knex';

@Injectable()
export class QueueTelegrafService {
    private readonly db: Knex;

    constructor(
        @InjectQueue(Constant.Q_TELEGRAF_CONFIG_MD)
        private readonly queue: Queue,
        private readonly knexUtil: KnexUtil
    ) {
        this.db = this.knexUtil.getKnex();
    }

    async addJob(taskName: QueueTelegrafProcessType, md: Md) {
        const data = {
            id: md.id,
        };
        await this.queue.add(taskName, data, {
            jobId: md.id,
        });
    }

    async updateRtuLastUpdatedConfig(rtuIds: number[]) {
        await this.db('m_rtus').update({
            config_telegraf_updated_at: Math.floor(Date.now()/1000)
        }).whereIn('id', rtuIds);
    }

    generateConfig(rtu: RtuTelegrafConfigData): {
        filename: string,
        content: string
    } {
        const digitalPorts = rtu.ports?.filter((p) => p.mode == 'digital');
        const analogPorts = rtu.ports?.filter((p) => p.mode == 'analog');
        function formatDecimal(number) {
            if (Number.isInteger(number)) {
                return number + '.0';
            } else {
                return number.toString();
            }
        }

        let config = '';
        config += '[[inputs.modbus]]\n\n';
        config += `name = "${rtu.sname}"\n`;
        config += 'slave_id = 1\n';
        config += 'timeout = "1s"\n';
        config += `controller = "tcp://${rtu.ip_address}:502"\n\n`;

        config += 'discrete_inputs = [\n';
        digitalPorts?.forEach((port) => {
            config += '{';
            config += `measurement="${rtu.sname.replace(/-/g, '_')}", `;
            config += `name="${[port.identifier, port.no_port]
                .join('_')
                .replace(/-/g, '_')}", `;
            config += `address=[${Number(port.no_port.split('-')[1])}]`;
            config += `},\n`;
        });
        config += ']\n\n';

        config += 'holding_registers = [\n';
        analogPorts?.forEach((port) => {
            config += '{';
            config += `measurement="${rtu.sname.replace(/-/g, '_')}", `;
            config += `name="${[port.identifier, port.no_port]
                .join('_')
                .replace(/-/g, '_')}", `;
            config += `byte_order="AB", `;
            config += `data_type="UFIXED", `;
            config += `scale=${formatDecimal(
                Number(port.calibration_value),
            )}, `;
            config += `address=[${parseInt(port.no_port.split('-')[1])}]`;
            config += `},\n`;
        });
        config += ']\n\n';
        config += '[inputs.modbus.tags]\n';

        config += `regional_id="${rtu.id_m_regional}"\n`;
        config += `witel_id="${rtu.id_m_witel}"\n`;
        config += `datel_id="${rtu.id_m_datel}"\n`;
        config += `location_id="${rtu.id_m_location}"\n`;
        config += `rtu_id="${rtu.id}"\n`;

        return {
            filename: `rtu-${rtu.id}.conf`,
            content: config,
        };
    }
}
