import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Constant } from 'src/constants/constant';
import { QueuePrometheusProcessType } from './queue-prometheus.process';
import {
    RtuPrometheusAlertConfigData,
    RtuTelegrafConfigData,
} from 'src/resources/parameter/rtu/entities/rtu.entity';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { Knex } from 'knex';
import { Rrd, RrdConfigData } from 'src/resources/parameter/rrd/entities/rrd.entity';

@Injectable()
export class QueuePrometheusService {
    private readonly db: Knex;

    constructor(
        @InjectQueue(Constant.Q_PROMETHEUS_CONFIG_RRD)
        private readonly queue: Queue,
        private readonly knexUtil: KnexUtil,
    ) {
        this.db = this.knexUtil.getKnex();
    }

    async addJob(taskName: QueuePrometheusProcessType, rrd: Rrd) {
        const data = {
            id: rrd.id,
        };
        await this.queue.add(taskName, data, {
            jobId: rrd.id,
        });
    }

    async updateRtuLastUpdatedConfig(rtuIds: number[]) {
        await this.db('m_rtus')
            .update({
                config_alert_port_updated_at: Math.floor(Date.now() / 1000),
                config_alert_formula_updated_at: Math.floor(Date.now() / 1000),
            })
            .whereIn('id', rtuIds);
    }
    
    async getRrdConfigData(rrdId: number): Promise<RrdConfigData> {
        const queryRtus = this.db('m_rtus as rtu')
            .select(
                'rtu.id', 
                'rtu.sname',
                this.db.raw(`(select json_agg(port) from (
                    select 
                        mrp.id as id_m_rtu_port, 
                        mrp.id_m_port, 
                        mrp.metrics,
                        mpt.duration,
                        mpt.id_m_severity,
                        mpt.id as id_m_port_treshold,
                        mpt.rule
                    from m_rtu_ports as mrp
                    inner join m_port_tresholds as mpt on (mpt.id_m_port = mrp.id_m_port and mpt.is_deleted = 0)
                    where mrp.id_m_rtu = rtu.id and mrp.is_deleted = 0
                ) as port) as treshold_ports`),
                this.db.raw(`(select json_agg(rtu_formula) from (
                    select 
                        mrf.uuid as uuid_m_rtu_formula, 
                        mft.id as id_m_formula_treshold, 
                        mrf.metrics,
                        mft.duration,
                        mft.id_m_severity,
                        mft.rule
                    from m_rtu_formula as mrf
                    inner join m_formula_tresholds as mft on (mft.id_m_formula = mrf.id_m_formula)
                    where mrf.id_m_rtu = rtu.id
                ) as rtu_formula) as treshold_formulas`),
                this.db.raw(`(select json_agg(rtu_formula_port) from (
                    select 
                        mft.uuid as uuid_m_formula_treshold, 
                        mrpf.metrics,
                        mft.duration,
                        mft.id_m_severity,
                        mft.rule
                    from m_rtu_port_formula as mrpf
                    inner join m_rtu_ports as mrp on (mrp.id = mrpf.id_m_rtu_port)
                    inner join m_formula_tresholds as mft on (mft.id_m_formula = mrpf.id_m_formula)
                    where mrp.id_m_rtu = rtu.id
                ) as rtu_formula_port) as treshold_formula_ports`),
            )
        .whereRaw('rtu.last_required_alert_port_config_update >= rtu.config_alert_port_updated_at')
        .orWhereRaw('rtu.last_required_alert_formula_config_update >= rtu.config_alert_formula_updated_at');

        const [rrd, rtus] = await Promise.all([
            await this.db('m_rrds').select('id', 'ip_address').where('id', rrdId).first<RrdConfigData>(),
            await queryRtus,
        ]);

        rrd.rtus = rtus;

        return rrd;
    }

    private generateRule (metrics: string, rule: string): string {
        return rule.replaceAll('val', metrics).replaceAll(' = ', ' == ');
    }

    generateConfig(rtu: RtuPrometheusAlertConfigData): {
        filename: string;
        content: string;
    } {
        const rtuSnameFormatted = rtu.sname.replaceAll('-', '_');
        let config = '';
        config += 'groups:\n';
        config += `- name: "${rtu.sname}"\n`;
        config += `  rules:\n`;
        config += `  - alert: ${rtu.sname}\n`;
        config += `    expr: absent({__name__=~"${rtuSnameFormatted}.*", job!="formula_rtu_${rtu.id}"}) == 1\n`;
        config += `    for : 30s\n`;
        config += '    labels:\n';
        config += `      status: off\n`;
        config += `      rtu_id: ${rtu.id}\n`;
        config += `      alert_type : "rtu"\n`;

        rtu.treshold_ports?.forEach((trh) => {
            config += `  - alert: ${trh.metrics}\n`;
            config += `    expr: ${this.generateRule(trh.metrics, trh.rule)}\n`;
            config += `    for : ${trh.duration}s\n`;
            config += '    labels:\n';
            config += `      id_m_rtu_port: ${trh.id_m_rtu_port}\n`;
            config += `      id_m_port: ${trh.id_m_port}\n`;
            config += `      id_m_port_treshold: ${trh.id_m_port_treshold}\n`;
            config += `      id_m_severity: ${trh.id_m_severity}\n`;
            config += '      alert_type: "port"\n';
        });
        
        rtu.treshold_formulas?.forEach((trh) => {
            config += `  - alert: ${trh.metrics}\n`;
            config += `    expr: ${this.generateRule(trh.metrics, trh.rule)}\n`;
            config += `    for : ${trh.duration}s\n`;
            config += '    labels:\n';
            config += `      uuid_m_rtu_port_formula: ${trh.uuid_m_rtu_formula}\n`;
            config += `      id_m_formula_trehold: ${trh.id_m_formula_trehold}\n`;
            config += `      id_m_severity: ${trh.id_m_severity}\n`;
            config += '      alert_type: "rtu_formula"\n';
        });
        
        rtu.treshold_formula_ports?.forEach((trh) => {
            config += `  - alert: ${trh.metrics}\n`;
            config += `    expr: ${this.generateRule(trh.metrics, trh.rule)}\n`;
            config += `    for : ${trh.duration}s\n`;
            config += '    labels:\n';
            config += `      uuid_m_rtu_port_formula: ${trh.uuid_m_rtu_port_formula}\n`;
            config += `      id_m_formula_trehold: ${trh.id_m_formula_trehold}\n`;
            config += `      id_m_severity: ${trh.id_m_severity}\n`;
            config += '      alert_type: "rtu_port_formula"\n';
        });

        return {
            filename: 'alert-rtu-' + rtu.id + '.yml',
            content: config,
        };
    }
}
