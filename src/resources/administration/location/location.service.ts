import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { User } from '../user/entities/user.entity';
import { randomUUID } from 'crypto';
import { Location } from './entities/location.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class LocationService {
    private readonly db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateLocationDto, auth: User) {
        const datel = await this.db('m_organizations')
            .where({
                id: data.id_m_organization,
                is_deleted: 0,
                level: 3,
            })
            .first();

        if (!datel) {
            throw new UnprocessableEntityException('Datel tidak ditemukan');
        }

        const existing = await this.db<Location>('m_locations')
            .where(q => q.whereILike('sname', data.sname).orWhereILike('name', data.name))
            .where('is_deleted', 0)
            .first();

        if (existing) {
            let message = 'Nama telah digunakan';

            if (existing.sname.toLocaleLowerCase() == data.sname.toLocaleLowerCase()) {
                message = 'Sname telah digunakan';
            }

            throw new UnprocessableEntityException(message);
        }

        const uuid = randomUUID();
        data.sname = data.sname.toLocaleUpperCase();

        await this.db('m_locations').insert({
            ...data,
            uuid,
            created_at: Math.floor(Date.now()/1000),
            created_by: auth.id,
        });

        return {
            uuid,
            ...data
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'loc.id',
            'loc.uuid',
            'loc.name',
            'loc.sname',
            'loc.pic',
            this.db.raw("max(cast(split_part(split_part(rtu.sname, 'RTU', 2), '-', 1) as integer)) as max_rtu_sname_number"),
            'loc.created_at',
            'loc.updated_at',
        ];
        const query = this.db<Location>('m_locations as loc')
            .select(select)
            .leftJoin('m_rtus as rtu', function() {
                this.on('rtu.id_m_location', 'loc.id');
                this.onVal('rtu.is_deleted', 0);
            })
            .where('loc.is_deleted', 0)
            .groupBy('loc.id');

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

        return new PaginationResponse<Location>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'loc.id',
            'loc.uuid',
            'loc.name',
            'loc.sname',
            'loc.pic',
            'loc.created_at',
            'loc.updated_at',
        ];
        const query = this.db<Location>('m_locations as loc')
            .select(select)
            .where('loc.uuid', uuid)
            .where('loc.is_deleted', 0);

        return await query.first();
    }

    async update(uuid: string, data: UpdateLocationDto, auth: User) {
        const datel = await this.db('m_organizations')
            .where({
                id: data.id_m_organization,
                is_deleted: 0,
                level: 3,
            })
            .first();

        if (!datel) {
            throw new UnprocessableEntityException('Datel tidak ditemukan');
        }

        await this.db.transaction(async (trx) => {
            const exsisting = await trx<Location>('m_locations')
                .select('id', 'name', 'sname')
                .where(q => q.whereILike('sname', data.sname).orWhereILike('name', data.name))
                .where('is_deleted', 0)
                .whereNot('uuid', uuid)
                .first();

            if (exsisting) {
                let message = 'Nama telah digunakan';

                if (exsisting.sname == data.sname) {
                    message = 'Sname telah digunakan';
                }

                throw new UnprocessableEntityException(message);
            }

            const detail = await trx<Location>('m_locations')
                .where('uuid', uuid)
                .first();

            await trx('m_locations')
                .update({
                    ...data,
                    updated_at: Math.floor(Date.now()/1000),
                    updated_by: auth.id,
                })
                .where({ uuid });

            if (detail.sname != data.sname) {
                /**
                 * publish queue generate config because metrics contain location sname
                 *  - config alert md (if md is_virtual == 1)
                 *  - config alert port
                 *  - config alert formula
                 */
            //     await trx('m_rtus')
            //         .update({
            //             sname: trx.raw(`replace(
            //                     sname,
            //                     concat('-', ${detail.sname}),
            //                     concat('-', ${data.sname})
            //                 )`),
            //             updated_at: trx.raw('now()'),
            //         })
            //         .whereLike('sname', `RTU%-${detail.sname}`);
            //     console.log('RTU sname updated');

            //     await trx('m_rtu_ports')
            //         .update({
            //             metrics: trx.raw(`replace(
            //                     metrics,
            //                     concat('_', ${detail.sname}, '_'),
            //                     concat('_', ${data.sname}, '_')
            //                 )`),
            //             updated_at: trx.raw('now()'),
            //         })
            //         .whereLike('sname', `RTU%_${detail.sname}_%`);
            //     console.log('RTU Port metrics updated');

            //     await trx('m_rtu_formula')
            //         .update({
            //             metrics: trx.raw(`replace(
            //                     metrics,
            //                     concat('_', ${detail.sname}, '_'),
            //                     concat('_', ${data.sname}, '_')
            //                 )`),
            //             updated_at: trx.raw('now()'),
            //         })
            //         .whereLike('sname', `RTU%_${detail.sname}_%`);
            //     console.log('RTU Formula metrics updated');
            }
        });

        return data;
    }

    async remove(uuid: string, auth: User) {
        return (
            (await this.db('m_locations')
                .update({
                    updated_at: this.db.raw('now()'),
                    updated_by: auth.id,
                    is_deleted: 1,
                })
                .where({ uuid })) === 1
        );
    }
}
