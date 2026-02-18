import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { Port } from './entities/port.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { randomUUID } from 'crypto';
import { conditionsRequireUpdateConfig } from '../rtu/entities/rtu.entity';
import { Md } from '../md/entities/md.entity';

@Injectable()
export class PortService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreatePortDto, auth: User) {
        const existing = await this.db<Port>('m_ports')
            .select('id', 'identifier')
            .where('identifier', data.identifier)
            .where('is_deleted', 0)
            .first();

        if (existing) {
            throw new UnprocessableEntityException(
                'Identifier telah digunakan',
            );
        }

        const uuid = randomUUID();

        await this.db('m_ports').insert({
            ...data,
            uuid,
            created_by: auth.id,
            updated_by: auth.id,
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'mp.id',
            'mp.uuid',
            'mp.name',
            'mp.identifier',
            'mp.description',
            'mp.unit',
            'mp.calibration_value',
            'mp.mode',
            'mp.created_at',
            'mp.updated_at',
        ];
        const query = this.db<Port>('m_ports as mp')
            .select(select)
            .where('mp.is_deleted', 0);

        const countQuery = this.db
            .count('x.id as total')
            .fromRaw(`(${query.toQuery()}) x`)
            .first();

        if (paging.limit) {
            query.limit(paging.limit);
        }

        if (paging.page) {
            const limit = paging.limit ?? 0;
            const offset = limit * paging.page - limit;

            query.offset(offset);
        }

        const [datas, count] = await Promise.all<any>([
            await query,
            await countQuery,
        ]);

        return new PaginationResponse<Port>(paging, count.total, datas);
    }

    async findOne(uuid: string, isForConfig?: boolean): Promise<Port> {
        const select = [
            'mp.id',
            'mp.uuid',
            'mp.name',
            'mp.identifier',
            'mp.description',
            'mp.id_m_device_type',
            'mp.unit',
            'mp.calibration_value',
            'mp.mode',
            'mp.created_at',
            'mp.updated_at',
        ];
        const query = this.db<Port>('m_ports as mp')
            .select(select)
            .where('mp.uuid', uuid)
            .where('mp.is_deleted', 0);

        const data = await query.first<Port>();
        if (!data) {
            throw new UnprocessableEntityException('Tipe Port tidak ditemukan');
        }
        const [device, rtusRequiredUpdateConfig] = await Promise.all([
            await this.db('m_device_type').select('id', 'name').where('id', data.id_m_device_type).first(),
            await this.db('m_rtus as rtu')
            .count('rtu.id')
            .innerJoin('m_rtu_ports as mrp', function () {
                this.on('mrp.id_m_rtu', 'rtu.id');
                this.onVal('mrp.id_m_port', data.id);
                this.onVal('mrp.is_deleted', 0);
            })
            .whereRaw(conditionsRequireUpdateConfig.join(' OR '))
            .first<{ count: number }>()
        ]);
        data.device_type = device;
        data.is_config_update_required = rtusRequiredUpdateConfig.count > 0;
        return data;
    }

    async getDataForConfigUpdateByPortId(id: number): Promise<{id_m_md: number, id_m_rrd: number}[]> {
        const mds = await this.db('m_mds as md').select('md.id as id_m_md', 'md.id_m_rrd')
        .innerJoin('m_rrds as rrd', 'rrd.id', 'md.id_m_rrd')
        .innerJoin('m_rtus as rtu', function () {
            this.on('rtu.id_m_md', 'md.id');
            this.onVal('rtu.is_deleted', 0);
        })
        .innerJoin('m_rtu_ports as mrp', function () {
            this.on('mrp.id_m_rtu', 'rtu.id');
            this.onVal('mrp.is_deleted', 0);
        })
        .where('mrp.id_m_port', id)
        .where('rrd.is_deleted', 0)
        .where('md.is_deleted', 0)
        .groupBy('md.id')
        .groupBy<{id_m_md: number, id_m_rrd: number}[]>('rrd.id');
        
        return mds;
    }

    async findById(id: number): Promise<Port> {
        const select = [
            'mp.id',
            'mp.uuid',
            'mp.name',
            'mp.identifier',
            'mp.description',
            'mp.unit',
            'mp.created_at',
            'mp.updated_at',
            'mp.updated_by',
        ];
        const query = this.db('m_ports as mp')
            .select(select)
            .where('mp.id', id)
            .where('mp.is_deleted', 0);

        const data = await query.first<Port>();
        if (!data) {
            throw new UnprocessableEntityException('Tipe Port tidak ditemukan');
        }
        const rtusRequiredUpdateConfig = await this.db<{ count: number }>(
            'm_rtus as rtu',
        )
            .count('rtu.id')
            .innerJoin('m_rtu_ports as mrp', function () {
                this.on('mrp.id_m_rtu', 'rtu.id');
                this.onVal('mrp.id_m_port', data.id);
                this.onVal('mrp.is_deleted', 0);
            })
            .whereRaw(conditionsRequireUpdateConfig.join(' OR '));
        console.log(rtusRequiredUpdateConfig);
        return data;
    }

    async update(uuid: string, data: UpdatePortDto, auth: User) {
        delete data.mode;
        await this.db.transaction(async (trx) => {
            const existing = await this.db<Port>('m_ports')
                .select('id', 'identifier')
                .where('identifier', data.identifier)
                .whereNot('uuid', uuid)
                .where('is_deleted', 0)
                .first();

            if (existing) {
                throw new UnprocessableEntityException(
                    'Identifier telah digunakan',
                );
            }

            const previous = await trx<Port>('m_ports')
                .where('uuid', uuid)
                .first();

            if (!previous) {
                throw new UnprocessableEntityException('Port tidak ditemukan');
            }
            await trx('m_ports')
                .update({
                    ...data,
                    updated_by: auth.id,
                    updated_at: Math.floor(Date.now() / 1000),
                })
                .where('uuid', uuid);

            if (previous.identifier !== data.identifier) {
                console.log('identifier updated');
                const updated = await trx<{
                    id_m_rtu: number;
                    metrics: string;
                }>('m_rtu_ports')
                    .update({
                        metrics: trx.raw(
                            `replace(
                                metrics, 
                                concat('_', '${previous.identifier}'), 
                                concat('_', '${data.identifier}')
                            )`,
                        ),
                    })
                    .where('id_m_port', previous.id)
                    .where('is_deleted', 0)
                    .returning('id_m_rtu');
                const rtuIds = [
                    ...new Set(updated.map((item) => item.id_m_rtu)),
                ];
                const metricsRaw = `replace(metrics, concat('_', '${previous.identifier}'), concat('_', '${data.identifier}'))`;
                const formulaRaw = `replace(formula, concat(':', '${previous.identifier}'), concat(':', '${data.identifier}'))`;
                await trx('m_rtu_formula')
                    .update({
                        metrics: trx.raw(metricsRaw),
                    })
                    .whereLike('metrics', `%_${previous.identifier}%`);
                await trx('m_formulas')
                    .update({
                        formula: trx.raw(formulaRaw),
                    })
                    .whereLike('formula', `%:${previous.identifier}`);
                if (rtuIds.length > 0) {
                    await trx('m_rtu_port_formula')
                        .update({
                            metrics: trx.raw(metricsRaw),
                            formula: formulaRaw,
                        })
                        .whereLike('metrics', `%_${previous.identifier}%`);

                    const epochSecond = Math.floor(Date.now() / 1000);
                    const rtuUpdate = {
                        last_required_telegraf_config_update: epochSecond,
                        last_required_alert_port_config_update: epochSecond,
                        last_required_alert_formula_config_update: epochSecond,
                    };
                    await trx('m_rtus').update(rtuUpdate).whereIn('id', rtuIds);
                }
            } else if (previous.calibration_value !== data.calibration_value) {
                console.log('calibration updated');
                const rtuPorts = await trx<{ id_m_rtu: number }>('m_rtu_ports')
                    .select('id_m_rtu')
                    .where('id_m_port', previous.id)
                    .where('is_deleted', 0)
                    .groupBy('id_m_rtu');

                if (rtuPorts.length > 0) {
                    await trx('m_rtus')
                        .update({
                            last_required_telegraf_config_update: Math.floor(
                                Date.now() / 1000,
                            ),
                        })
                        .whereIn(
                            'id',
                            rtuPorts.map((i) => i.id_m_rtu),
                        );
                }
            }
        });
        return data;
    }

    async remove(uuid: string, auth: User) {
        await this.db.transaction(async (trx) => {
            const detail = await trx<{ id: number; total_rtu_port: number }>(
                'm_ports as port',
            )
                .select('port.id', trx.raw('count(mrp.id) as total_rtu_port'))
                .leftJoin('m_rtu_ports as mrp', function () {
                    this.on('mrp.id_m_port', 'port.id');
                    this.onVal('mrp.is_deleted', 0);
                })
                .where('port.uuid', uuid)
                .where('port.is_deleted', 0)
                .groupBy('port.id')
                .first();

            if (!detail) {
                throw new UnprocessableEntityException(
                    'Tipe Port tidak ditemukan',
                );
            }

            if (detail.total_rtu_port > 0) {
                throw new UnprocessableEntityException(
                    'Tipe Port telah digunakan',
                );
            }

            await trx('m_ports').update({
                is_deleted: 0,
                updated_by: auth.id,
                updated_at: Math.floor(Date.now() / 1000),
            });
            /** TODO:
             *  Add QUEUE to update config telegraf and alert
             *  Delete m_tanks, delete m_
             */
        });
    }
}
