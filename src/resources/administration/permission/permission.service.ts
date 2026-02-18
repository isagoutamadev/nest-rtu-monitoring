import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { Knex } from 'knex';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { Permission } from './entities/permission.entity';
import { randomUUID } from 'crypto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PermissionService {
    private readonly db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreatePermissionDto, auth: User) {
        await this.db('m_permissions').insert({
            uuid: randomUUID(),
            ...data,
            created_at: this.db.raw('now()'),
            created_by: auth.id
        });

        return data;
    }

    async get(paging: PaginationDto) {
        const query = this.db('m_permissions').select(
            'id',
            'uuid',
            'name',
            'description',
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

        return new PaginationResponse<Permission>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const query = this.db('m_permissions').select(
            'id',
            'uuid',
            'name',
            'description',
            'created_at',
            'updated_at',
        );
        query.where('is_deleted', 0);
        query.where('uuid', uuid);
        return await query.first();
    }

    async update(uuid: string, data: UpdatePermissionDto, auth: User) {
        await this.db('m_permissions').update({
            ...data,
            updated_at: this.db.raw('now()'),
            updated_by: auth.id
        }).where({uuid});

        return data;
    }

    async remove(uuid: string, auth: User) {
        return await this.db('m_permissions').update({
            updated_at: this.db.raw('now()'),
            updated_by: auth.id,
            is_deleted: 1
        }).where({uuid});
    }
}
