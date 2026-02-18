import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '../user/entities/user.entity';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { randomUUID } from 'crypto';
import { Organization } from './entities/organization.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { SearchOrganizationDto } from './dto/search-organization.dto';

@Injectable()
export class OrganizationService {
    private readonly db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateOrganizationDto, auth: User) {
        const parent = await this.db<Organization>('m_organizations')
            .where('is_deleted', 0)
            .where('id', data.parent_id)
            .first();
        if (!parent) {
            throw new NotFoundException('Parent tidak ditemukan');
        }

        if (parent.level > 2) {
            throw new UnprocessableEntityException(
                'Datel tidak dapat menjadi parent',
            );
        }

        const exsisting = await this.db<Organization>('m_organizations')
            .where(q => q.whereILike('sname', data.sname).orWhereILike('name', data.name))
            .where('is_deleted', 0)
            .first();

        if (exsisting) {
            console.log(exsisting);
            let message = 'Nama telah digunakan';

            if (exsisting.sname == data.sname) {
                message = 'Sname telah digunakan';
            }

            throw new UnprocessableEntityException(message);
        }

        await this.db('m_organizations').insert({
            ...data,
            level: parent.level + 1,
            uuid: randomUUID(),
            created_at: Math.floor(Date.now()/1000),
            created_by: auth.id,
        });

        return data;
    }

    async hierarchy(withDatel: boolean) {
        const { rows } = await this.db.raw(`
            SELECT 
                id, name,
                (SELECT JSON_AGG(org1) FROM 
                    (SELECT id, name,
                        (SELECT JSON_AGG(org2) from 
                            (SELECT mo2.id, mo2.name
                                ${
                                    withDatel
                                        ? `,(SELECT JSON_AGG(org3) FROM 
                                    (SELECT mo3.id, mo3.name FROM m_organizations as mo3
                                    WHERE mo3.level = 3 AND mo3.parent_id = mo2.id AND mo3.is_deleted = 0) as org3
                                ) as organizations`
                                        : ''
                                }
                            FROM m_organizations as mo2
                            WHERE mo2.level = 2 AND mo2.parent_id = mo1.id AND mo2.is_deleted = 0
                            ) as org2
                        ) as organizations
                        FROM m_organizations as mo1
                        WHERE mo1.level = 1 AND mo1.parent_id = org0.id AND mo1.is_deleted = 0
                    ) as org1
                ) as organizations 
            FROM m_organizations org0
            WHERE org0.level = 0
        `);

        return rows;
    }

    async findAll(paging: PaginationDto, search: SearchOrganizationDto) {
        const select = [
            'org.id',
            'org.uuid',
            'org.name',
            'org.sname',
            'org.level',
            'org.created_at',
            'org.updated_at',
        ];
        const query = this.db<Organization>('m_organizations as org')
            .select(select)
            .where('org.is_deleted', 0);

        if (search.level) {
            query.where('org.level', search.level);    
        }
        
        if (search.sname) {
            query.where('org.sname', search.sname);    
        }
        
        if (search.name) {
            query.where('org.name', search.name);    
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

        const [datas, count] = await Promise.all<any>([
            await query,
            await countQuery,
        ]);

        return new PaginationResponse<Organization>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = ['id', 'uuid', 'name', 'sname', 'level'];

        const query = this.db<Organization>('m_organizations as organization')
            .select(select)
            .where('is_deleted', 0)
            .where('uuid', uuid);

        return await query.first();
    }

    async update(uuid: string, data: UpdateOrganizationDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const parent = await trx<Organization>('m_organizations')
                .where('is_deleted', 0)
                .where('id', data.parent_id)
                .first();

            if (!parent) {
                throw new NotFoundException('Parent tidak ditemukan');
            }

            if (parent.level > 2) {
                throw new UnprocessableEntityException(
                    'Datel tidak dapat menjadi parent',
                );
            }

            const exsisting = await trx<Organization>('m_organizations')
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

            const org = await trx<Organization>('m_organizations').where('uuid', uuid).first();
            await trx<Organization>('m_organizations')
                .update({
                    ...data,
                    level: parent.level + 1,
                    updated_by: auth.id,
                    updated_at: Math.ceil(Date.now()/1000),
                })
                .where('uuid', uuid);

            if (org.sname != data.sname && org.level === 1) {
                /**
                 * publish queue generate config because metrics contain regional sname
                 *  - config alert md (if md is_virtual == 1)
                 *  - config alert port
                 *  - config alert formula
                 */
            //     await trx('m_rtus').update({
            //         sname: trx.raw(`replace(
            //             sname,
            //             concat('-', ${org.sname}, '-'),
            //             concat('-', ${data.sname}, '-')
            //         )`),
            //         updated_at: trx.raw('now()'),
            //     }).whereLike('sname', `RTU%-${org.sname}-%`);
            //     console.log("RTU sname updated");

            //     await trx('m_rtu_ports').update({
            //         metrics: trx.raw(`replace(
            //             metrics,
            //             concat('_', ${org.sname}, '_'),
            //             concat('_', ${data.sname}, '_')
            //         )`),
            //     }).whereLike('sname', `RTU%_${org.sname}_%`);
            //     console.log("RTU Port metrics updated");

            //     await trx('m_rtu_formula').update({
            //         metrics: trx.raw(`replace(
            //             metrics,
            //             concat('_', ${org.sname}, '_'),
            //             concat('_', ${data.sname}, '_')
            //         )`),
            //         updated_at: trx.raw('now()'),
            //     }).whereLike('sname', `RTU%_${org.sname}_%`);
            //     console.log("RTU Formula metrics updated");
            }
        });

        return data;
    }

    async remove(uuid: string, auth: User): Promise<boolean> {
        const result = await this.db('m_organizations')
            .update({
                updated_by: auth.id,
                updated_at: this.db.raw('now()'),
                is_deleted: 1,
            })
            .where('uuid', uuid);

        return result === 1;
    }
}
