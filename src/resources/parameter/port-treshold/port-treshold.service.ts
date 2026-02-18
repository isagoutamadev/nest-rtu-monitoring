import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePortTresholdDto } from './dto/create-port-treshold.dto';
import { UpdatePortTresholdDto } from './dto/update-port-treshold.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PortTreshold } from './entities/port-treshold.entity';
import { Port } from '../port/entities/port.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { randomUUID } from 'crypto';
import { User } from 'src/resources/administration/user/entities/user.entity';

@Injectable()
export class PortTresholdService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(port: Port, data: CreatePortTresholdDto, auth: User) {
        const uuid = randomUUID();

        await this.db.transaction(async (trx) => {
            await trx('m_port_tresholds').insert({
                uuid,
                id_m_port: port.id,
                ...data,
                created_by: auth.id,
            });

            const rtusContainPorts = await trx('m_rtu_ports as mrp')
                .select('id_m_rtu')
                .where('is_deleted', 0)
                .where('id_m_port', port.id);
            if (rtusContainPorts.length > 0) {
                const rtuIds = rtusContainPorts.map((item) => item.id_m_rtu);
                console.log(rtuIds);
                await trx('m_rtus')
                    .update({
                        last_required_alert_port_config_update: Math.floor(
                            Date.now() / 1000,
                        ),
                    })
                    .whereIn('id', rtuIds);
            }
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto, portUuid: string) {
        const select = [
            'mpt.id',
            'mpt.uuid',
            // 'mpt.id_m_severity',
            this.db.raw(`json_build_object(
                'id', ms.id,
                'title', ms.title,
                'color', ms.color
            ) as severity`),
            'mpt.id_m_port',
            'mpt.label',
            'mpt.rule',
            'mpt.description',
            'mpt.duration',
            'mpt.created_at',
            'mpt.updated_at',
        ];

        const query = this.db<PortTreshold>('m_port_tresholds as mpt')
            .select(select)
            .innerJoin('m_ports as port', function () {
                this.on('port.id', 'mpt.id_m_port');
                this.onVal('port.uuid', portUuid);
                this.onVal('port.is_deleted', 0);
            })
            .innerJoin('m_severity as ms', 'ms.id', 'mpt.id_m_severity')
            .where('mpt.is_deleted', 0);

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

        return new PaginationResponse(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'mpt.id',
            'mpt.uuid',
            'mpt.id_m_severity',
            'mpt.label',
            'mpt.rule',
            'mpt.description',
            'mpt.duration',
            'mpt.created_at',
            'mpt.updated_at',
        ];

        const query = this.db<PortTreshold>('m_port_tresholds as mpt')
            .select(select)
            .where('mpt.is_deleted', 0)
            .where('mpt.uuid', uuid);

        const data = await query.first();

        if (data) {
            return data;
        }

        throw new UnprocessableEntityException('Treshold tidak ditemukan');
    }

    async update(
        uuid: string,
        data: UpdatePortTresholdDto,
        port: Port,
        auth: User,
    ) {
        await this.db.transaction(async (trx) => {
            const treshold = await trx('m_port_tresholds')
                .where('uuid', uuid)
                .first<PortTreshold>();
            if (!treshold) {
                throw new UnprocessableEntityException(
                    'Treshold tidak ditemukan',
                );
            }
            await trx('m_port_tresholds')
                .update({
                    ...data,
                    updated_by: auth.id,
                    updated_at: Math.ceil(Date.now() / 1000),
                })
                .where('uuid', uuid);
            const isConfigUpdateRequired =
                treshold.duration != data.duration ||
                treshold.id_m_severity != data.id_m_severity ||
                treshold.rule != data.rule;
            if (isConfigUpdateRequired) {
                console.log('Update Config Required', port);
                const rtusContainPorts = await trx('m_rtu_ports as mrp')
                    .select('id_m_rtu')
                    .where('is_deleted', 0)
                    .where('id_m_port', port.id);
                if (rtusContainPorts.length > 0) {
                    const rtuIds = rtusContainPorts.map(
                        (item) => item.id_m_rtu,
                    );
                    console.log(rtuIds);
                    await trx('m_rtus')
                        .update({
                            last_required_alert_port_config_update: Math.floor(
                                Date.now() / 1000,
                            ),
                        })
                        .whereIn('id', rtuIds);
                }
            }
        });

        return {
            uuid,
            ...data,
        };
    }

    async remove(uuid: string, auth: User) {
        await this.db.transaction(async (trx) => {
            const treshold = await trx('m_port_tresholds')
                .where('uuid', uuid)
                .first<PortTreshold>();
            if (!treshold) {
                throw new UnprocessableEntityException(
                    'Treshold tidak ditemukan',
                );
            }
            const trhs = await trx('m_port_tresholds')
                .update({
                    updated_by: auth.id,
                    is_deleted: auth.id,
                    updated_at: Math.ceil(Date.now() / 1000),
                })
                .where('uuid', uuid)
                .returning<{id_m_port: number}>('id_m_port');
            const rtusContainPorts = await trx('m_rtu_ports as mrp')
                .select('id_m_rtu')
                .where('is_deleted', 0)
                .where('id_m_port', trhs[0].id_m_port);
            if (rtusContainPorts.length > 0) {
                const rtuIds = rtusContainPorts.map(
                    (item) => item.id_m_rtu,
                );
                console.log(rtuIds);
                await trx('m_rtus')
                    .update({
                        last_required_alert_port_config_update: Math.floor(
                            Date.now() / 1000,
                        ),
                    })
                    .whereIn('id', rtuIds);
            }
        });
    }
}
