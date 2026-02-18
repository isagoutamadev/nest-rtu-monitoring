import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { randomBytes, randomUUID } from 'crypto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { Api } from './entities/api.entity';
import { User } from '../user/entities/user.entity';
import { hashSync } from 'bcrypt';

@Injectable()
export class ApiService {
    private db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    private generateApiToken(length: number): string {
        const token = randomBytes(Math.ceil(length / 2)).toString('hex');
        return token.slice(0, length);
    }

    async create(data: CreateApiDto, auth: User) {
        const uuid = randomUUID();
        const token = 'tkapioss_' + this.generateApiToken(32);
        const roleIds = data.role_ids;
        delete data.role_ids;
        await this.db.transaction(async (trx) => {
            const existing = await trx<Api>("m_apis").where("is_deleted", 0)
            .where("name", data.name).first();
            if (existing) {
                throw new UnprocessableEntityException("Nama API sudah digunakan");
            }
            const apis = await trx<Api>('m_apis')
                .insert({
                    uuid,
                    token,
                    ...data,
                    created_by: auth.id,
                })
                .returning('id');

            const users = await trx<User>('m_users')
                .insert({
                    uuid,
                    id_m_api: apis[0].id,
                    id_m_organization: 1,
                    email: '',
                    username: data.name,
                    name: data.name,
                    password: hashSync(token, 8),
                    created_by: auth.id,
                })
                .returning('id');

            await trx('m_user_role').insert(
                roleIds.map((roleId) => {
                    return {
                        id_m_user: users[0].id,
                        id_m_role: roleId,
                    };
                }),
            );
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto) {
        const query = this.db('m_apis').select(
            'id',
            'uuid',
            'name',
            'token',
            'expired_at',
            'created_at',
            'updated_at',
        );
        query.where('is_deleted', 0);

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

        return new PaginationResponse<Api>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const query = this.db('m_apis').select(
            'id',
            'uuid',
            'name',
            'token',
            'expired_at',
            'created_at',
            'updated_at',
        );
        query.where('is_deleted', 0);
        query.where('uuid', uuid);
            
        const api = await query.first<Api>();
        const queryRoles = this.db('m_roles as mr').select([
            "mr.id",
            "mr.uuid",
            "mr.name",
        ])
        .innerJoin('m_user_role as mur', 'mur.id_m_role', 'mr.id')
        .innerJoin('m_users as mu', 'mu.id', 'mur.id_m_user')
        .where('mu.id_m_api', api.id);


        api.roles = await queryRoles;

        return api;
    }

    async update(uuid: string, data: UpdateApiDto, auth: User) {
        const roleIds = data.role_ids;
        delete data.role_ids;
        await this.db.transaction(async (trx) => {
            const existing = await trx<Api>("m_apis").where("is_deleted", 0)
            .where("name", data.name).whereNot("uuid", uuid).first();
            if (existing) {
                throw new UnprocessableEntityException("Nama API sudah digunakan");
            }
            const apis = await trx<Api>('m_apis')
                .update({
                    ...data,
                    updated_by: auth.id,
                    updated_at: Math.floor(Date.now()/1000),
                })
                .where("uuid", uuid)
                .returning('id');
            
            if (apis.length === 0) {
                throw new UnprocessableEntityException('Data API tidak ditemukan');
            }

            const users = await trx<User>('m_users')
                .update({
                    id_m_api: apis[0].id,
                    id_m_organization: 1,
                    email: '',
                    username: data.name,
                    name: data.name,
                    updated_by: auth.id,
                })
                .where("id_m_api", apis[0].id)
                .returning('id');

            await trx('m_user_role').where('id_m_user', users[0].id).delete();
            await trx('m_user_role').insert(
                roleIds.map((roleId) => {
                    return {
                        id_m_user: users[0].id,
                        id_m_role: roleId,
                    };
                }),
            );
        });

        return {
            ...data,
        };
    }

    async remove(uuid: string, auth: User) {
        await this.db.transaction(async (trx) => {
            const apis = await trx<Api>('m_apis')
                .update({
                    updated_by: auth.id,
                    updated_at: Math.floor(Date.now()/1000),
                    is_deleted: 1,
                })
                .where("uuid", uuid)
                .returning('id');
            
            if (apis.length === 0) {
                throw new UnprocessableEntityException('Data API tidak ditemukan');
            }

            await trx<User>('m_users')
                .update({
                    updated_by: auth.id,
                    is_deleted: 1,
                })
                .where("id_m_api", apis[0].id);
        });
    }
}
