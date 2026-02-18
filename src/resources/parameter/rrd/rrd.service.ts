import {
    Injectable,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRrdDto } from './dto/create-rrd.dto';
import { UpdateRrdDto } from './dto/update-rrd.dto';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { Knex } from 'knex';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { randomUUID } from 'crypto';
import { Rrd } from './entities/rrd.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class RrdService {
    private readonly db: Knex;
    private readonly logger: Logger;
    constructor(
        private readonly knexUtil: KnexUtil,
    ) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateRrdDto, auth: User) {
        const existing = await this.db<Rrd>('m_rrds').where({
            ip_address: data.ip_address,
            is_deleted: 0,
        }).first();

        if (existing) {
            throw new UnprocessableEntityException('IP telah digunakan');
        }

        const uuid = randomUUID();
        await this.db('m_rrds').insert({
            uuid,
            ...data,
            created_by: auth.id,
        });

        /* publish data to queue for prometheus installation at {data.ip_address}*/

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'rrd.id',
            'rrd.uuid',
            'rrd.name',
            'rrd.ip_address',
            'rrd.created_at',
            'rrd.updated_at',
        ];
        const query = this.db<Rrd>('m_rrds as rrd')
            .select(select)
            .where('rrd.is_deleted', 0);

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

        return new PaginationResponse<Rrd>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const query = this.db<Rrd>('m_rrds as rrd').select(
            'rrd.id',
            'rrd.uuid',
            'rrd.name',
            'rrd.ip_address',
            'rrd.created_at',
            'rrd.updated_at',
        );
        query.where('rrd.uuid', uuid);
        query.where('rrd.is_deleted', 0);

        const data = await query.first();
        
        if (!data) {
            throw new NotFoundException('RRD not found');
        }
        
        return data;
    }

    async update(uuid: string, data: UpdateRrdDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const existing = await this.db<Rrd>('m_rrds').where({
                ip_address: data.ip_address,
                is_deleted: 0,
            })
            .whereNot('uuid', uuid)
            .first();
            
            if (existing) {
                throw new UnprocessableEntityException('IP telah digunakan');
            }

            const previous = await trx<Rrd>('m_rrds')
                .where('uuid', uuid)
                .where('is_deleted', 0)
                .first();

            if (!previous) {
                throw new UnprocessableEntityException('RRD tidak ditemukan');
            }

            await trx('m_rrds')
                .update({
                    ...data,
                    updated_by: auth.id,
                    updated_at: this.db.fn.now(),
                })
                .where({ uuid });

            if (previous.ip_address != data.ip_address) {
                this.logger.log('IP RRD changed');
                /**
                 * publish data to queue for prometheus installation at ${data.ip_address}
                 * publish data to queue for uninstall prometheus at ${previous.ip_address}
                 * in installation queue consumer check if the prometheus already have children (mds -> rtus -> rtu formulas) to generate config
                 *  - config md json
                 *  - config alert md
                 *  - config alert port
                 *  - config alert formula
                 */
            }
        });

        return data;
    }

    async remove(uuid: string, auth: User) {
        let rowsAffected = 0;
        await this.db.transaction(async (trx) => {
            const detail = await trx('m_rrds as rrd')
                .select(
                    "rrd.id",
                    "rrd.ip_address",
                    trx.raw("count(md.id) as count_md"),
                )
                .leftJoin("m_mds as md", function () {
                    this.on("md.id_m_rrd", "rrd.id");
                    this.onVal("md.is_deleted", 0);
                })
                .where('rrd.uuid', uuid)
                .where('rrd.is_deleted', 0)
                .groupBy("rrd.id")
                .first();

            if (!detail) {
                throw new UnprocessableEntityException('RRD tidak ditemukan');
            }

            if (detail.count_md > 0) {
                throw new UnprocessableEntityException('RRD tidak dapat dihapus!\n terdapat MD yang terelasi');
            }

            rowsAffected = await trx('m_rrds')
                .update({
                    updated_by: auth.id,
                    updated_at: this.db.fn.now(),
                    is_deleted: 1,
                })
                .where({ uuid });

            if (rowsAffected > 0) {
                /**
                 * publish data to queue for uninstall prometheus at ${detail.ip_address}
                 */
            }
        });

        return rowsAffected > 0;
    }
}
