import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreateMdDto } from './dto/create-md.dto';
import { UpdateMdDto } from './dto/update-md.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { Md, MdStatus, MdConfigData } from './entities/md.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { randomUUID } from 'crypto';
import { User } from 'src/resources/administration/user/entities/user.entity';

@Injectable()
export class MdService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateMdDto, auth: User) {
        if (data.is_virtual === 1) {
            /** Force Virtual MD location to null */
            delete data.id_m_location;
        } else {
            /** Force Phisical MD PORT to 9273 */
            data.port = 9273;
        }

        if (data.is_backup === 1) {
            /** Force md backup cannot backed up by other md */
            delete data.id_m_md_backup;
        }

        const existing = await this.db<Md>('m_mds as md')
            .select('md.id', 'md.uuid')
            .whereRaw('(md.ip_address = :ip_address and md.port = :port)', {
                ip_address: data.ip_address,
                port: data.port,
            })
            .where('md.is_deleted', 0)
            .first();
        console.log(existing);
        if (existing) {
            throw new UnprocessableEntityException(
                `${data.ip_address}:${data.port} telah digunakan`,
            );
        }

        const uuid = randomUUID();

        await this.db('m_mds').insert({
            ...data,
            uuid,
            status: MdStatus.OFF,
            sname: this.db.raw("concat('MD-', currval('m_mds_id_seq'))"),
            created_by: auth.id,
            updated_by: auth.id,
        });

        /** TODO:
         * ADD Queue MD SSH
         * if (is_virtual === 1) {
         *  Create new docker compose
         * } else {
         *  Install telegraf
         * }
         */

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'md.id',
            'md.uuid',
            'md.name',
            'md.sname',
            'md.ip_address',
            'md.port',
            'md.status',
            'md.created_at',
            'md.updated_at',
        ];
        const query = this.db<Md>('m_mds as md')
            .select(select)
            .where('md.is_deleted', 0);

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

        return new PaginationResponse<Md>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'md.id',
            'md.uuid',
            'md.id_m_rrd',
            'md.id_m_location',
            'md.id_m_md_backup',
            'md.name',
            'md.sname',
            'md.ip_address',
            'md.port',
            'md.status',
        ];
        const query = this.db('m_mds as md').select(select);
        query.where('md.uuid', uuid);
        query.where('md.is_deleted', 0);

        const data = await query.first();
        return data;
    }

    async configFindById(
        id: number,
        config?: { isConfigTelegraf?: boolean; isConfigPrometheus?: boolean },
    ): Promise<MdConfigData> {
        const select = [
            'md.id',
            'md.uuid',
            'md.id_m_rrd',
            'md.is_virtual',
            'md.name',
            'md.sname',
            'md.ip_address',
            'md.port',
        ];
        const query = this.db('m_mds as md').select(select);
        query.where('md.id', id);
        query.where('md.is_deleted', 0);

        const data = await query.first<MdConfigData>();

        if (config) {
            const queryRRD = this.db('m_rrds')
                .select(['ip_address', 'id'])
                .where('id', data.id_m_rrd);

            const queryRtu = this.db('m_rtus as rtu')
                .select(
                    'rtu.id',
                    'rtu.uuid',
                    'rtu.sname',
                    'rtu.ip_address',
                    'rtu.id_m_location',
                    'witel.parent_id as id_m_regional',
                    'witel.id as id_m_witel',
                    'datel.id as id_m_datel',
                    this.db.raw(`(
                    select json_agg(port) from (
                            select 
                                mrp.no_port,
                                mp.identifier,
                                mp.calibration_value,
                                mp.mode
                            from m_rtu_ports as mrp
                            inner join m_ports as mp on (mp.id = mrp.id_m_port)
                            where mp.is_deleted = 0 and mrp.is_deleted = 0 and mrp.id_m_rtu = rtu.id
                        ) as port
                    ) as ports`),
                )
                .innerJoin('m_locations as loc', 'loc.id', 'rtu.id_m_location')
                .innerJoin(
                    'm_organizations as datel',
                    'datel.id',
                    'loc.id_m_organization',
                )
                .innerJoin(
                    'm_organizations as witel',
                    'witel.id',
                    'datel.parent_id',
                )
                .where('rtu.id_m_md', data.id);

            if (config.isConfigPrometheus) {
                data.rrd = await queryRRD.first();
            } else if (config.isConfigTelegraf) {
                data.telegraf_rtus = await queryRtu.whereRaw(
                    'rtu.config_telegraf_updated_at <= rtu.last_required_telegraf_config_update',
                );
            } else {
                const [rrd, rtus] = await Promise.all([
                    await queryRRD.first(),
                    await queryRtu,
                ]);

                data.rrd = rrd;
                data.telegraf_rtus = rtus;
            }
        }

        return data;
    }

    async update(uuid: string, data: UpdateMdDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const previous = await trx<Md>('m_mds as md')
                .where('md.uuid', uuid)
                .where('md.is_deleted', 0)
                .first();
            if (!previous) {
                throw new UnprocessableEntityException('MD tidak ditemukan');
            }

            await trx('m_mds')
                .update({
                    ...data,
                    updated_at: trx.fn.now(),
                    updated_by: auth.id,
                })
                .where('uuid', uuid);

            if (previous.ip_address != data.ip_address) {
                /** TODO:
                 * Add Queue to remove md in previous ip through SSH
                 * if (MD VIRTUAL) {
                 *  update config in rrd through ssh
                 *
                 *  remove docker compose at previos ip
                 *  remove docker container at previos ip
                 *
                 *  create docker compose at new ip
                 *  create docker container at new ip
                 *  generate config RTUs if already have RTUs
                 * } else {
                 *  unistall telegraf at previous IP
                 *  install telegraf at new ip
                 *  generate config RTUs if already have RTUs
                 * }
                 */
            }

            if (previous.id_m_rrd != data.id_m_rrd) {
                /** TODO:
                 * Add Queue to remove md in previous ip through SSH
                 * if (MD VIRTUAL) {
                 *  create config MD in new RRD through ssh
                 *  generate config Alert RTUs in RRD if already have RTUs
                 * }
                 */
            }
        });

        return data;
    }

    async remove(uuid: string, auth: User) {
        const md = await this.db('m_mds as md')
            .select(
                'md.id',
                this.db.raw('count(md_main.id) as total_md_main'),
                this.db.raw('count(rtu.id) as total_rtu'),
            )
            .leftJoin('m_rtus as rtu', function () {
                this.on('rtu.id_m_md', 'md.id');
                this.onVal('rtu.is_deleted', 0);
            })
            .leftJoin('m_mds as md_main', function () {
                this.on('md_main.id_m_md_backup', 'md.id');
                this.onVal('md_main.is_deleted', 0);
            })
            .where('md.is_deleted', 0)
            .where('md.uuid', uuid)
            .groupBy('md.id')
            .first();

        if (!md) {
            throw new UnprocessableEntityException('MD tidak ditemukan');
        }

        if (md.total_md_main > 0) {
            throw new UnprocessableEntityException(
                'MD telah digunakan untuk mem-backup MD lain',
            );
        }

        if (md.total_rtu > 0) {
            throw new UnprocessableEntityException(
                'MD telah digunakan oleh RTU',
            );
        }

        await this.db('m_mds')
            .update({
                updated_by: auth.id,
                updated_at: this.db.raw('now()'),
                is_deleted: 1,
            })
            .where('uuid', uuid);
        /** TODO:
         * Add Queue to remove MD through ssh
         * if (is_virtual === 1) {
         *  Delete docker compose
         *  Remove docker container
         * } else {
         *  Uninstall telegraf
         * }
         *
         */
    }
}
