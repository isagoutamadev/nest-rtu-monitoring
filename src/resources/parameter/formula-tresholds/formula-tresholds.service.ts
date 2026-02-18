import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateFormulaTresholdDto } from './dto/create-formula-treshold.dto';
import { UpdateFormulaTresholdDto } from './dto/update-formula-treshold.dto';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { randomUUID } from 'crypto';
import { Rtu } from '../rtu/entities/rtu.entity';
import { Formula } from '../formula/entities/formula.entity';
import { FormulaTreshold } from './entities/formula-treshold.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class FormulaTresholdsService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async create(formula: Formula, data: CreateFormulaTresholdDto, auth: User) {
        const uuid = randomUUID();
        await this.db.transaction(async (trx) => {
            data.id_m_formula = formula.id;
            await trx('m_formula_tresholds').insert({
                ...data,
                uuid,
                created_by: auth.id,
            });

            if (formula.is_specific_port === 0) {
                await trx<Rtu>('m_rtus').update({
                    last_required_alert_formula_config_update: Math.floor(Date.now()/1000),
                });
            }
        });

        return {
            uuid,
            ...data
        };
    }

    async findAll(formulaUuid: string, paging: PaginationDto) {
        const select = [
            'mft.id',
            'mft.uuid',
            'mft.id_m_severity',
            'mft.id_m_formula',
            'mft.label',
            'mft.rule',
            'mft.description',
            'mft.created_at',
            'mft.updated_at',
        ];

        const query = this.db<Formula>('m_formula_tresholds as mft')
            .select(select)
            .innerJoin("m_formulas as f", function () {
                this.on("f.id", "mft.id_m_formula");
                this.onVal("f.uuid", formulaUuid);
                this.onVal("f.is_deleted", 0);
            })
            .where('mft.is_deleted', 0);

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

        return new PaginationResponse<FormulaTreshold>(paging, count.total, datas);
    }

    async findOne(uuid: string) {
        const select = [
            'mft.id',
            'mft.id_m_severity',
            'mft.id_m_formula',
            'mft.label',
            'mft.rule',
            'mft.description',
            'mft.created_at',
            'mft.updated_at',
        ];

        const query = this.db('m_formula_tresholds as mft')
            .select(select)
            .where('mft.is_deleted', 0)
            .where('mft.uuid', uuid);

        const detail = await query.first<FormulaTreshold>();

        if (!detail) {
            throw new UnprocessableEntityException('Treshold tidak ditemukan');
        }

        return detail;
    }

    async update(formula: Formula, uuid: string, data: UpdateFormulaTresholdDto, auth: User) {
        await this.db.transaction(async (trx) => {
            data.id_m_formula = formula.id;
            const detail = await trx('m_formula_tresholds')
                .where('id_m_formula', formula.id)
                .where('uuid', uuid)
                .first<FormulaTreshold>();
            if (!detail) {
                throw new UnprocessableEntityException('Treshold tidak ditemukan');
            }
            await trx('m_formula_tresholds').update({
                ...data,
                updated_by: auth.id,
                updated_at: Math.floor(Date.now()/1000),
            }).where('uuid', uuid);

            if (formula.is_specific_port === 0) {
                if (data.id_m_severity != detail.id_m_severity || data.rule != detail.rule) {
                    await trx<Rtu>('m_rtus').update({
                        last_required_alert_formula_config_update: Math.floor(Date.now()/1000),
                    });
                }
            }
        });

        return data;
    }

    async remove(formula: Formula, uuid: string, auth: User) {
        await this.db.transaction(async (trx) => {
            const detail = await trx('m_formula_tresholds')
                .where('id_m_formula', formula.id)
                .where('uuid', uuid)
                .first<FormulaTreshold>();

            if (!detail) {
                throw new UnprocessableEntityException('Treshold tidak ditemukan');
            }
            await trx('m_formula_tresholds').update({
                is_deleted: 1,
                updated_by: auth.id,
                updated_at: Math.floor(Date.now()/1000),
            }).where('uuid', uuid);

            if (formula.is_specific_port === 0) {
                await trx<Rtu>('m_rtus').update({
                    last_required_alert_formula_config_update: Math.floor(Date.now()/1000),
                });
            }
        });
    }
}
