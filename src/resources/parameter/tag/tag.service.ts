import { Injectable, Logger } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { Tag } from './entities/tag.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TagService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }
    
    async create(data: CreateTagDto, auth: User) {
        const uuid = randomUUID();
        await this.db('m_tags').insert({
            ...data,
            uuid,
            created_by: auth.id, 
        });

        return {
            uuid,
            ...data,
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'tag.id',
            'tag.uuid',
            'tag.name',
            'tag.description',
            'tag.created_at',
            'tag.updated_at',
        ];

        const query = this.db<Tag>('m_tags as tag')
            .select(select)
            .where('tag.is_deleted', 0);

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

        return new PaginationResponse<Tag>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'tag.id',
            'tag.uuid',
            'tag.name',
            'tag.description',
            'tag.created_at',
            'tag.updated_at',
        ];
        
        const query = this.db<Tag>('m_tags as tag')
            .select(select)
            .where('tag.uuid', uuid)
            .where('tag.is_deleted', 0);

        await query.first();
    }

    async update(uuid: string, data: UpdateTagDto, auth: User) {
        await this.db('m_tags').update({
            ...data,
            updated_by: auth.id,
            updated_at: Math.floor(Date.now()/1000)
        })
        .where({uuid});

        return data;
    }

    async remove(uuid: string, auth: User) {
        await this.db('m_tags').update({
            is_deleted: 1,
            updated_by: auth.id,
            updated_at: Math.floor(Date.now()/1000)
        })
        .where({uuid});
    }
}
