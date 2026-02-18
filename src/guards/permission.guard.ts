import { CanActivate, ExecutionContext, ForbiddenException, Injectable, mixin } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';

export const PermissionGuard = (...permissions: string[] | undefined) => {
    @Injectable()
    class PermissionGuardMixin implements CanActivate {
        public readonly db: Knex;
        constructor (public readonly knexUtil: KnexUtil) {
            this.db = this.knexUtil.getKnex();
        }

        async getPermissionNamesByUserId (userId): Promise<string[]>{
            const query = this.db<{name: string}>('m_user_role as mup').select('mp.name');
            query.innerJoin('m_role_permission as mrp', 'mrp.id_m_role', 'mup.id_m_role');
            query.innerJoin('m_permissions as mp', 'mp.id', 'mrp.id_m_permission');
            query.where('mup.id_m_user', userId);

            const datas = await query;

            return datas.map(item => item.name);
        }

        matchPermission (userPermissions: string[]) {
            return permissions.some(permission => userPermissions.includes(permission));
        }

        async canActivate(ctx: ExecutionContext) {
            const req = ctx.switchToHttp().getRequest();
            const userPermissions = await this.getPermissionNamesByUserId(req.auth.id);
            req.auth.permissions = userPermissions;
            
            if (!permissions) {
                return true;    
            }

            if (permissions.length === 0) {
                return true;
            }

            if (this.matchPermission(userPermissions)) {
                return true;
            }

            throw new ForbiddenException("Salah satu permission dibutuhkan " + permissions.join(', '));
        }
    }

    const guard = mixin(PermissionGuardMixin);
    return guard;
};
