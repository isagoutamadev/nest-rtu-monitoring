import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { User } from './entities/user.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
    private db: Knex;
    
    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async get(paging: PaginationDto){
        const query = this.db('m_users').select(
            'id',
            'uuid',
            'name',
            'username',
            'email',
            'is_ldap',
            'is_active',
        );
        query.where('is_deleted', 0);

        const countQuery = this.db.count("x.id as total").fromRaw(`(${query.toQuery()}) x`).first();

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
            await countQuery
        ]);
        
        return new PaginationResponse<User>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'user.id',
            'user.uuid',
            'user.name',
            'user.username',
            'user.email',
            'user.phone',
            'user.profile_picture',
            'user.telegram_username',
            'user.is_telegram_verified',
            'user.is_telegram_approved',
            'user.is_ldap',
            'user.is_active',
            this.db.raw(`(
            select json_agg(role) from (
              select mr.id, mr.name from m_roles as mr
              inner join m_user_role as mur on (mur.id_m_role = mr.id)
              where mur.id_m_user = "user".id
            ) as role)
            as roles`),
        ];

        const query = this.db<User>('m_users as user').select(select).where("user.uuid", uuid);

        return await query.first();
    }

    async create(data: CreateUserDto, auth: User): Promise<User> {
        let user: User;
        await this.db.transaction(async trx => {
            const role_ids = data.role_ids;
            delete data.role_ids;
            
            const isEmailOrUsernameUsed = await trx<User>("m_users").where("is_deleted", 0)
            .where(q => q.where("username", data.username).orWhere("email", data.email)).first();
            
            if (isEmailOrUsernameUsed) {
                const errorMessage = data.email === isEmailOrUsernameUsed.email ? "Email telah digunakan" : "Username telah digunakan";
                throw new HttpException(errorMessage, HttpStatus.UNPROCESSABLE_ENTITY);
            }
            
            data.password = hashSync(data.password, 8);
            const users = await trx('m_users').insert({
                ...data,
                uuid: randomUUID(),
                created_by: auth.id,
                created_at: trx.raw('now()'),
            }).returning('*');
            user = users[0];

            await trx('m_user_role').insert(role_ids.map(id => {
                return {
                    id_m_role: id,
                    id_m_user: user.id
                }
            }));
        });

        delete user.password;
        return user;
    }

    async update(uuid: string, data: CreateUserDto, auth: User): Promise<User> {
        let user: User;
        await this.db.transaction(async trx => {
            const role_ids = data.role_ids;
            delete data.role_ids;
            
            const isEmailOrUsernameUsed = await trx<User>("m_users").where("is_deleted", 0).whereNot("uuid", uuid)
            .where(q => q.where("username", data.username).orWhere("email", data.email)).first();
            
            if (isEmailOrUsernameUsed) {
                const errorMessage = data.email === isEmailOrUsernameUsed.email ? "Email telah digunakan" : "Username telah digunakan";
                throw new HttpException(errorMessage, HttpStatus.UNPROCESSABLE_ENTITY);
            }
            
            data.password = hashSync(data.password, 8);
            const users = await trx('m_users').update({
                ...data,
                updated_by: auth.id,
                updated_at: trx.raw('now()'),
            }).where({uuid}).returning('*');
            user = users[0];

            await trx('m_user_role').where('id_m_user', user.id).delete();

            await trx('m_user_role').insert(role_ids.map(id => {
                return {
                    id_m_role: id,
                    id_m_user: user.id
                }
            }));
        });

        delete user.password;
        return user;
    }
    
    async remove(uuid: string, auth: User): Promise<boolean> {
        const result = await this.db('m_users').update({
            updated_by: auth.id,
            updated_at: this.db.raw('now()'),
        }).where({uuid});
        console.log(result === 1);
        return result === 1;
    }
}
