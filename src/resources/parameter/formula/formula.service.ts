import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateFormulaDto } from './dto/create-formula.dto';
import { UpdateFormulaDto } from './dto/update-formula.dto';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { randomUUID } from 'crypto';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { Formula } from './entities/formula.entity';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class FormulaService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(data: CreateFormulaDto, auth: User) {
        const uuid = randomUUID();
        await this.db.transaction(async (trx) => {
            await trx('m_formulas').insert({
                ...data,
                uuid,
                created_by: auth.id,
            });
            
            /** TODO:
             * - GENERATE m_rtu_formula if is_specific_port == 0
             * - Add queue to generate configs if is_specific_port == 0 and active formula exist
             */
        });

        return {
            uuid,
            ...data
        };
    }

    async findAll(paging: PaginationDto) {
        const select = [
            'f.id',
            'f.uuid',
            'f.name',
            'f.identifier',
            'f.formula',
            'f.mode',
            'f.is_specific_port',
            'f.created_at',
            'f.updated_at',
        ];
        const query = this.db<Formula>('m_formulas as f')
            .select(select)
            .where('f.is_deleted', 0);

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

        return new PaginationResponse<Formula>(paging, count.total, datas);
    }

    async findOne(uuid: string): Promise<Formula> {
        const select = [
            'f.id',
            'f.uuid',
            'f.name',
            'f.identifier',
            'f.formula',
            'f.mode',
            'f.is_specific_port',
            'f.created_at',
            'f.updated_at',
        ];
        const query = this.db('m_formulas as f')
            .select(select)
            .where('f.is_deleted', 0)
            .where('f.uuid', uuid);
        
        const detail = await query.first<Formula>();

        if (!detail) {
            throw new UnprocessableEntityException('Formula tidak ditemukan');    
        }

        return detail;
    }

    async update(uuid: string, data: UpdateFormulaDto, auth: User) {
        await this.db.transaction(async (trx) => {
            const formulas = await trx('m_formulas').update({
                ...data,
                updated_by: auth.id,
                updated_at: Math.floor(Date.now()/1000)
            }).where('uuid', uuid).returning('id');

            /** TODO:
             * - GENERATE m_rtu_formula if is_specific_port == 0
             * - Add queue to generate configs if is_specific_port == 0 and active formula exist
             */
        });

        return data;
    }

    async remove(uuid: string, auth: User) {
        await this.db.transaction(async (trx) => {
            await trx('m_formulas').where('uuid', uuid).update({
                is_deleted: 1,
                updated_at: Math.floor(Date.now()/1000)
            });
            /** TODO:
             * - Delete m_rtu_formula
             * - Add queue to re-generate configs if is_specific_port == 0 and active formula exist
             */
        });
    }
}
