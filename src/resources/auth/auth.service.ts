import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../administration/user/entities/user.entity';
import { hashSync } from'bcrypt';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { randomUUID } from 'crypto';
import { Permission } from '../administration/permission/entities/permission.entity';

@Injectable()
export class AuthService {
    private db: Knex;
    
    constructor (
        private readonly knexUtil: KnexUtil
    ) {
        this.db = this.knexUtil.getKnex();
    }
    
    async login(data: LoginDto): Promise<User|undefined> {
        const select = [
            'id',
            'uuid',
            'name',
            'password',
            'is_ldap',
            'is_active',
            'profile_picture',
        ];
        const user = await this.db("m_users")
        .select(select)
        .where("username", data.username)
        .where('is_deleted', 0)
        .first();

        return user;
    }
    
    async getUserPermissions(userId: number): Promise<string[]> {
        const query = this.db<Permission>("m_permissions as permission").select('permission.name').where('permission.is_deleted', 0);
        query.innerJoin('m_role_permission as mrp', 'mrp.id_m_permission', 'permission.id');
        query.innerJoin('m_user_role as mur', 'mur.id_m_role', 'mrp.id_m_role');
        query.where('mur.id_m_user', userId);
        const results = await query;

        return results.map(item => item.name);
    }

    async register(data: RegisterDto): Promise<User> {
        let user: User;
        await this.db.transaction(async trx => {
            const role_id = data.role_id;
            delete data.role_id;
            
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
                created_by: trx.raw("currval('m_users_id_seq')"),
                created_at: trx.raw('now()'),
            }).returning('*');
            user = users[0];

            await trx('m_user_role').insert({
                id_m_role: role_id,
                id_m_user: user.id
            });
        });

        delete user.password;
        return user;
    }
}
