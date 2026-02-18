import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from '../user/entities/user.entity';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { Role } from './entities/role.entity';
import { randomUUID } from 'crypto';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class RoleService {
    private readonly db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateRoleDto, auth: User) {
        let role: Role;
        await this.db.transaction(async (trx) => {
            const permissionIds = data.permission_ids;
            delete data.permission_ids;

            const roles = await trx<Role>('m_roles')
                .insert({
                    uuid: randomUUID(),
                    ...data,
                    created_at: trx.raw('now()'),
                    created_by: auth.id,
                })
                .returning('*');
            role = roles[0];

            await trx('m_role_permission').insert(
                permissionIds.map((id) => {
                    return {
                        id_m_role: role.id,
                        id_m_permission: id,
                    };
                }),
            );
        });

        return role;
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'role.id',
            'role.uuid',
            'role.name',
            'role.description',
            'role.created_at',
            'role.updated_at',
        ];
        const query = this.db<Role>('m_roles as role')
            .select(select)
            .where('is_deleted', 0);
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

        return new PaginationResponse<Role>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'role.id',
            'role.uuid',
            'role.name',
            'role.description',
            'role.created_at',
            'role.updated_at',
            this.db.raw(`(
            select json_agg(permission) from (
              select mp.id, mp.name from m_permissions as mp
              inner join m_role_permission as mrp on (mrp.id_m_permission =  mp.id)
              where mrp.id_m_role = role.id
            ) as permission)
            as permissions`),
        ];

        const query = this.db<Role>('m_roles as role')
            .select(select)
            .where('role.uuid', uuid);

        return await query.first();
    }

    async update(uuid: string, data: UpdateRoleDto, auth: User) {
        let role: Role;
        await this.db.transaction(async (trx) => {
            const permissionIds = data.permission_ids;
            delete data.permission_ids;

            const roles = await trx('m_roles')
                .update({
                    ...data,
                    updated_at: trx.raw('now()'),
                    updated_by: auth.id,
                })
                .where({ uuid })
                .returning('*');

            if (roles.length > 0) {
                role = roles[0];
                await trx('m_role_permission')
                    .delete()
                    .where('id_m_role', role.id);
                await trx('m_role_permission').insert(
                    permissionIds.map((id) => {
                        return {
                            id_m_role: role.id,
                            id_m_permission: id,
                        };
                    }),
                );
            }
        });

        return role;
    }

    async remove(uuid: string, auth: User): Promise<boolean> {
        const result = await this.db<Role>('m_roles')
            .update({
                updated_at: this.db.raw('now()'),
                updated_by: auth.id,
                is_deleted: 1,
            })
            .where('uuid', uuid);

        return result === 1;
    }
}
