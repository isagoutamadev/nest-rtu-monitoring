import {
    HttpStatus,
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { KnexUtil } from 'src/utils/knex/knex.util';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    private db: Knex;
    constructor(
        private readonly jwtService: JwtService,
        private readonly knexUtil: KnexUtil,
    ) {
        this.db = this.knexUtil.getKnex();
    }

    async getUserById(id) {
        const query = this.db<User>('m_users as user').select(
            'user.id',
            'user.id_m_organization',
            'user.is_active',
            'user.id_m_api',
        );

        query.where('user.id', id);
        query.where('user.is_deleted', 0);

        return await query.first();
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const bearer = req.headers.authorization;
        if (!bearer) {
            throw new UnauthorizedException();
        }

        const token = bearer.replace('Bearer ', '');
        try {
            const { id } = await this.jwtService.verifyAsync(token);
            const user = await this.getUserById(id);
            if (!user) {
                throw new Error("User tidak ditemukan");
            }

            if (user.is_active === 0) {
                throw new Error("User tidak aktif");
            }

            req['auth'] = user;
            return next();
        } catch (e) {
            throw new UnauthorizedException(undefined, e.message);
        }
    }
}
