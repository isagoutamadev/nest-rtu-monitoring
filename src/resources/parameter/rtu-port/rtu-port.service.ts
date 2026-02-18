import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRtuPortDto } from './dto/create-rtu-port.dto';
import { UpdateRtuPortDto } from './dto/update-rtu-port.dto';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { RtuPort } from './entities/rtu-port.entity';
import { randomUUID } from 'crypto';
import { Rtu } from '../rtu/entities/rtu.entity';
import { Tank } from '../tank/entities/tank.entity';
import { Port } from '../port/entities/port.entity';

@Injectable()
export class RtuPortService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }
    async create(rtu: Rtu, data: CreateRtuPortDto, auth: User) {
        const uuid = randomUUID();
        await this.db.transaction(async (trx) => {
            const existing = await trx<RtuPort>('m_rtu_ports')
                .where('no_port', data.no_port)
                .where('id_m_rtu', rtu.id)
                .where('is_deleted', 0)
                .first();

            if (existing) {
                throw new UnprocessableEntityException(
                    'No Port sudah digunakan',
                );
            }

            const port = await trx<{
                identifier: string;
                id: number;
                name: string;
            }>('m_ports')
                .select('name', 'identifier')
                .where('id', data.id_m_port)
                .first();
            const metrics = String(
                `${rtu.sname}_${port.identifier}_${data.no_port}`,
            ).replace(/-/g, '_');

            const tank = data.tank;
            delete data.tank;
            let formulas: {
                id_m_formula: number;
                formula: string;
                identifier: string;
            }[] = [];

            if (tank) {
                formulas = await trx('m_formulas as mf')
                    .select(
                        'mf.id as id_m_formula',
                        'mf.formula',
                        'mf.identifier',
                    )
                    .innerJoin(
                        'm_tank_form_formula as mtff',
                        'mtff.id_m_formula',
                        'mf.id',
                    )
                    .where('mtff.id_m_tank_form', tank.id_m_tank_form);
                if (formulas.length === 0) {
                    throw new UnprocessableEntityException(
                        `Formula ${port.name} (${port.identifier}) tipe port BBM belum tersedia, silahkan hubungi admin!`,
                    );
                }
            }

            const rtuPorts = await trx('m_rtu_ports')
                .insert({
                    ...data,
                    id_m_rtu: rtu.id,
                    uuid,
                    metrics,
                    created_by: auth.id,
                })
                .returning<{ id: number }[]>('id');

            if (tank) {
                await trx('m_tanks').insert({
                    ...tank,
                    uuid: randomUUID(),
                    id_m_rtu_port: rtuPorts[0].id,
                    created_by: auth.id,
                });

                const rtuPortFormulas = formulas.map((f) => {
                    return {
                        ...f,
                        uuid: randomUUID(),
                        formula: f.formula.replaceAll('NO_PORT', data.no_port),
                        id_m_rtu_port: rtuPorts[0].id,
                        metrics: metrics + f.identifier,
                    };
                });
            }

            await trx('m_rtus')
                .update({
                    last_required_telegraf_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                    last_required_alert_port_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                    last_required_alert_formula_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                })
                .where('id', rtu.id);
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(rtu: Rtu, paging: PaginationDto) {
        const select = [
            'mrp.id',
            'mrp.uuid',
            'mrp.id_m_rtu',
            'mrp.id_m_port',
            'mrp.description',
            'mrp.no_port',
            'mrp.created_at',
            'mrp.updated_at',
            'mrp.is_notified',
            'mrp.is_monitored',
            this.db.raw(`json_build_object(
                'uuid', mp.uuid, 
                'identifier', mp.identifier,
                'name', mp.name,
                'mode', mp.mode,
                'unit', mp.unit
            ) as port`)
        ];
        const query = this.db<RtuPort>('m_rtu_ports as mrp')
            .select(select)
            .innerJoin('m_ports as mp', 'mp.id', 'mrp.id_m_port')
            .where('mrp.id_m_rtu', rtu.id)
            .where('mrp.is_deleted', 0);

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

        return new PaginationResponse<RtuPort>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'mrp.id',
            'mrp.uuid',
            'mrp.id_m_rtu',
            'mrp.id_m_port',
            'mrp.description',
            'mrp.no_port',
            'mrp.created_at',
            'mrp.updated_at',
        ];
        const query = this.db('m_rtu_ports as mrp')
            .select(select)
            .where('mrp.uuid', uuid)
            .where('mrp.is_deleted', 0);

        const data = await query.first<RtuPort>();
        if (!data) {
            throw new UnprocessableEntityException('Port RTU tidak ditemukan');
        }

        const [rtu, tank, port] = await Promise.all([
            await this.db('m_rtus')
                .select('id', 'uuid', 'name', 'sname')
                .where('id', data.id_m_rtu)
                .first<Rtu>(),
            await this.db('m_tanks')
                .select('*')
                .where('id_m_rtu_port', data.id)
                .first<Tank>(),
            await this.db('m_ports')
                .select('id', 'uuid', 'name', 'identifier')
                .where('id', data.id_m_port)
                .first<Port>(),
        ]);

        data.rtu = rtu;
        data.port = port;
        data.tank = tank;

        return data;
    }

    async update(rtu: Rtu, uuid: string, data: UpdateRtuPortDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const existing = await trx<RtuPort>('m_rtu_ports')
                .where('no_port', data.no_port)
                .where('id_m_rtu', rtu.id)
                .whereNot('uuid', uuid)
                .where('is_deleted', 0)
                .first();

            if (existing) {
                throw new UnprocessableEntityException(
                    'No Port sudah digunakan',
                );
            }

            const port = await trx<{ identifier: string; id: number }>(
                'm_ports',
            )
                .select('identifier')
                .where('id', data.id_m_port)
                .first();
            const detail = await trx<RtuPort>('m_rtu_ports')
                .where('uuid', uuid)
                .first();

            const metrics = String(
                `${rtu.sname}_${port.identifier}_${data.no_port}`,
            ).replace(/-/g, '_');

            const tank = data.tank;
            delete data.tank;

            await trx('m_rtu_ports')
                .update({
                    ...data,
                    metrics,
                    updated_at: Math.floor(Date.now() / 1000),
                    updated_by: auth.id,
                })
                .where('uuid', uuid);

            if (detail.metrics != metrics) {
                await trx('m_rtu_port_formula').update({
                    metrics: trx.raw(
                        `replace(metrics, '${detail.metrics}', '${metrics}')`,
                    ),
                    formula: trx.raw(
                        `replace(formula, ':${detail.no_port}}', ':${data.no_port}}')`,
                    ),
                });

                await trx('m_rtus')
                    .update({
                        last_required_telegraf_config_update: Math.floor(
                            Date.now() / 1000,
                        ),
                        last_required_alert_port_config_update: Math.floor(
                            Date.now() / 1000,
                        ),
                        last_required_alert_formula_config_update: Math.floor(
                            Date.now() / 1000,
                        ),
                    })
                    .where('id', rtu.id);
            }
        });

        return data;
    }

    async remove(uuid: string) {
        await this.db.transaction(async (trx) => {
            const detail = await trx<{
                rtu_sname: string;
                id_m_rtu: number;
                ip_md: string;
                ip_rrd: string;
            }>('m_rtus as rtu')
                .select('rtu.sname as rtu_sname', 'mrp.id_m_rtu')
                .innerJoin('m_mds as md', 'md.id', 'rtu.id_m_md')
                .innerJoin('m_rrds as rrd', 'rrd.id', 'md.id_m_rrd')
                .innerJoin('m_rtu_ports as mrp', 'mrp.id_m_rtu', 'rtu.id')
                .where('uuid', uuid)
                .first();

            await trx('m_rtus')
                .update({
                    last_required_telegraf_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                    last_required_alert_port_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                    last_required_alert_formula_config_update: Math.floor(
                        Date.now() / 1000,
                    ),
                })
                .where('id', detail.id_m_rtu);

            await trx('m_rtu_ports').where({ uuid }).delete();
        });
    }
}
