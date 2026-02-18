import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRtuDto } from './dto/create-rtu.dto';
import { UpdateRtuDto } from './dto/update-rtu.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { Rtu, conditionsRequireUpdateConfig } from './entities/rtu.entity';
import { randomUUID } from 'crypto';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { Md } from '../md/entities/md.entity';
import { Location } from 'src/resources/administration/location/entities/location.entity';
import { SearchRtuDto } from './dto/search-rtu.dto';

@Injectable()
export class RtuService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    
    public isValidSname(sname: string): boolean {
        const pattern = /^RTU\d{2}-(D\d|R\d)-[A-Z]{3}$/;
        return pattern.test(sname);
    }

    async create(data: CreateRtuDto, auth: User) {
        const uuid = randomUUID();
        await this.db.transaction(async (trx) => {
            const existing = await trx<Rtu>('m_rtus')
                .whereRaw('(ip_address = :ip_address or sname = :sname)', {
                    ip_address: data.ip_address,
                    sname: data.sname,
                })
                .where('is_deleted', 0)
                .first();
            if (existing) {
                let message = 'RTU sudah tersedia';
                if (existing.ip_address === data.ip_address) {
                    message = 'IP Address telah digunakan';
                } else if (existing.sname === data.sname) {
                    message = 'SNAME telah digunakan';
                }

                throw new UnprocessableEntityException(message);
            }

            const tagIds = data.tag_ids;
            delete data.tag_ids;

            const rtus = await trx<Rtu>('m_rtus')
                .insert({
                    uuid,
                    ...data,
                    created_by: auth.id,
                })
                .returning('*');

            await trx('m_rtu_tag').insert(
                tagIds.map((id) => {
                    return {
                        id_m_tag: id,
                        id_m_rtu: rtus[0].id,
                    };
                }),
            );

            /** TODO:
             * - Generate m_rtu_formula with is_active = false
             */
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto, search: SearchRtuDto) {
        const select: any[] = [
            'rtu.id',
            'rtu.uuid',
            'rtu.name',
            'rtu.sname',
            'rtu.ip_address',
            'rtu.id_m_location',
            'rtu.status',
            'rtu.description',
            'rtu.created_at',
            'rtu.updated_at',
            this.db.raw(`CASE
                WHEN ${conditionsRequireUpdateConfig.join(' OR ')}
                    THEN true
                ELSE false
            END AS is_config_update_required`),
            this.db.raw(`json_build_object(
                'id', ml.id,
                'uuid', ml.uuid,
                'name', ml.name,
                'sname', ml.sname
            ) as location`),
            this.db.raw(`json_build_object(
                'id', md.id,
                'uuid', md.uuid,
                'name', md.name,
                'sname', md.sname,
                'ip_address', md.ip_address
            ) as md`),
        ];
        const query = this.db<Rtu>('m_rtus as rtu')
            .select(select)
            .innerJoin('m_locations as ml', function () {
                this.on('ml.id', 'rtu.id_m_location');
                this.onVal('ml.is_deleted', 0);
            })
            .innerJoin('m_mds as md', function () {
                this.on('md.id', 'rtu.id_m_md');
                this.onVal('ml.is_deleted', 0);
            })
            .where('rtu.is_deleted', 0);

        if (search.withPorts === 'true') {
            select.push(
                this.db.raw(`(
                select json_agg(cport) from (
                        select 
                            mrp.no_port,
                            concat(mrp.description, ' - ', mp.identifier) as description,
                            mp.mode
                        from m_rtu_ports as mrp
                        inner join m_ports as mp on (mp.id = mrp.id_m_port)
                        where mp.is_deleted = 0 and mrp.is_deleted = 0 and mrp.id_m_rtu = rtu.id
                    ) as cport
                ) as ports`),
            );
        }

        if (search.name) {
            query.whereILike('rtu.name', `%${search.name}%`);
        }

        if (search.sname) {
            query.whereILike('rtu.sname', `%${search.sname}%`);
        }

        if (search.ipAddress) {
            query.whereILike('rtu.ip_address', `%${search.ipAddress}%`);
        }

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
        console.log(query.toQuery());

        const [datas, count] = await Promise.all<any>([
            await query,
            await countQuery,
        ]);

        return new PaginationResponse<Rtu>(paging, count.total, datas);
    }

    async findOne(uuid: string, withRrd?: boolean): Promise<Rtu> {
        const select = [
            'rtu.id',
            'rtu.uuid',
            'rtu.name',
            'rtu.sname',
            'rtu.id_m_md',
            'rtu.id_m_location',
            'rtu.description',
            'rtu.ip_address',
            'rtu.status',
            this.db.raw(`CASE
                WHEN ${conditionsRequireUpdateConfig.join(' OR ')}
                    THEN true
                ELSE false
            END AS is_config_update_required`),
            this.db.raw(`(
                select json_agg(tag) from (
                        select 
                            mt.id,
                            mt.uuid,
                            mt.name
                        from m_rtu_tag as mrt
                        inner join m_tags as mt on (mt.id = mrt.id_m_tag)
                        where mt.is_deleted = 0 and mrt.id_m_rtu = rtu.id
                    ) as tag
                ) as tags`),
            'rtu.created_at',
            'rtu.updated_at',
        ];
        const query = this.db<Rtu>('m_rtus as rtu')
            .select(select)
            .where('rtu.uuid', uuid)
            .where('rtu.is_deleted', 0);

        const data = await query.first<Rtu>();
        if (!data) {
            throw new UnprocessableEntityException('RTU tidak ditemukan');
        }

        const [md, location] = await Promise.all([
            await this.db('m_mds').where('id', data.id_m_md).first<Md>(),
            await this.db('m_locations')
                .where('id', data.id_m_location)
                .first<Location>(),
        ]);

        data.md = md;
        if (withRrd) {
            data.md.rrd = await this.db().select('id').from('m_rrds').first();
        }
        data.location = location;

        if (!data) {
            throw new UnprocessableEntityException('RTU tidak ditemukan');
        }

        return data;
    }

    async update(uuid: string, data: UpdateRtuDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const existing = await trx<Rtu>('m_rtus')
                .whereRaw('(ip_address = :ip_address or sname = :sname)', {
                    ip_address: data.ip_address,
                    sname: data.sname,
                })
                .where('is_deleted', 0)
                .whereNot('uuid', uuid)
                .first();
            if (existing) {
                let message = 'RTU sudah tersedia';
                if (existing.ip_address === data.ip_address) {
                    message = 'IP Address telah digunakan';
                } else if (existing.sname === data.sname) {
                    message = 'SNAME telah digunakan';
                }

                throw new UnprocessableEntityException(message);
            }

            const previous = await trx<Rtu>('m_rtus')
                .where('uuid', uuid)
                .first();

            if (!previous) {
                throw new UnprocessableEntityException('RTU tidak ditemukan');
            }

            const optionalData: any = {};
            if (
                previous.id_m_location != data.id_m_location ||
                previous.sname != data.sname ||
                previous.id_m_md != data.id_m_md
            ) {
                optionalData.last_required_telegraf_config_update = Math.floor(
                    Date.now() / 1000,
                );
                optionalData.last_required_alert_port_config_update =
                    Math.floor(Date.now() / 1000);
                optionalData.last_required_alert_formula_config_update =
                    Math.floor(Date.now() / 1000);
            }

            if (previous.ip_address != data.ip_address) {
                optionalData.last_required_telegraf_config_update = Math.floor(
                    Date.now() / 1000,
                );
            }

            const tagIds = data.tag_ids;
            delete data.tag_ids;

            const rtus = await trx<Rtu>('m_rtus')
                .update({
                    ...data,
                    ...optionalData,
                    updated_at: Math.floor(Date.now() / 1000),
                    updated_by: auth.id,
                })
                .where('uuid', uuid)
                .returning('id');

            await trx('m_rtu_tag').where('id_m_rtu', rtus[0].id).delete();
            await trx('m_rtu_tag').insert(
                tagIds.map((id) => {
                    return {
                        id_m_tag: id,
                        id_m_rtu: rtus[0].id,
                    };
                }),
            );

            if (previous.sname != data.sname) {
                const rtuPorts = await trx<{ id: number; metrics: string }>(
                    'm_rtu_ports',
                )
                    .where('id_m_rtu', rtus[0].id)
                    .update({
                        metrics: trx.raw(
                            `replace(metrics, '${previous.sname.replace(
                                /-/g,
                                '_',
                            )}', '${data.sname.replace(/-/g, '_')}')`,
                        ),
                    })
                    .returning('id');

                await trx('m_rtu_formula')
                    .where('id_m_rtu', rtus[0].id)
                    .update({
                        metrics: trx.raw(
                            `replace(metrics, '${previous.sname.replace(
                                /-/g,
                                '_',
                            )}', '${data.sname.replace(/-/g, '_')}')`,
                        ),
                    });

                await trx('m_rtu_port_formula')
                    .whereIn(
                        'id_m_rtu_port',
                        rtuPorts.map((i) => i.id),
                    )
                    .update({
                        metrics: trx.raw(
                            `replace(metrics, '${previous.sname.replace(
                                /-/g,
                                '_',
                            )}', '${data.sname.replace(/-/g, '_')}')`,
                        ),
                    });
                /** TODO:
                 * - Add Queue remove previous config (telegraf and alert)
                 */
            }

            if (previous.id_m_md != data.id_m_md) {
                /** TODO:
                 * - Add Queue to remove config at previous md and rrd
                 */
            }
        });

        return data;
    }

    async remove(uuid: string) {
        const detail = await this.db<{
            rtu_sname: string;
            ip_md: string;
            ip_rrd: string;
        }>('m_rtus as rtu')
            .select('rtu.sname as rtu_sname')
            .innerJoin('m_mds as md', 'md.id', 'rtu.id_m_md')
            .innerJoin('m_rrds as rrd', 'rrd.id', 'md.id_m_rrd')
            .where('rtu.uuid', uuid)
            .first();
        /** TODO:
         *  - Add QUEUE Remove configs (prometheus, telegraf)
         */
        await this.db('m_rtus').where({ uuid }).update({
            is_deleted: 1,
        });
    }
}
