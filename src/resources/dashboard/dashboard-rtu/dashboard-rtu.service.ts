import { Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';
import { RecordRtuStatus } from './entities/dashboard-rtu.entity';
import { Rtu } from 'src/resources/parameter/rtu/entities/rtu.entity';

@Injectable()
export class DashboardRtuService {
    private readonly db: Knex;
    private readonly logger: Logger;

    constructor(private readonly knexUtil: KnexUtil) {
        this.logger = new Logger();
        this.db = this.knexUtil.getKnex();
    }

    async findAll(paging: PaginationDto) {
        const select: any[] = [
            'rtu.id',
            'rtu.uuid',
            'rtu.name',
            'rtu.sname',
            'rtu.ip_address',
            'rtu.status',
            'rtu.description',
            this.db.raw(`json_build_object(
                'uuid', ml.uuid,
                'name', ml.name,
                'sname', ml.sname
            ) as location`),
            
        ];
        const query = this.db<Rtu>('m_rtus as rtu')
            .select(select)
            .innerJoin('m_locations as ml', function () {
                this.on('ml.id', 'rtu.id_m_location');
                this.onVal('ml.is_deleted', 0);
            })
            .innerJoin('m_mds as md', function () {
                this.on('md.id', 'rtu.id_m_md');
                this.onVal('ml.is_deleted', 0);
            })
            .where('rtu.is_deleted', 0);

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

        return new PaginationResponse<Rtu>(paging, count.total, datas);
    }
    
    async getRtusFormulaAndPort(paging: PaginationDto) {
        const select = [
            'rtu.id',
            'rtu.uuid',
            'rtu.name',
            'rtu.sname',
            'rtu.ip_address',
            'rtu.status',
            'rtu.description',
            this.db.raw(`json_build_object(
                'uuid', ml.uuid,
                'name', ml.name,
                'sname', ml.sname,
                'latitude', ml.latitude,
                'longitude', ml.longitude
            ) as location`),
            
        ];
        const query = this.db<Rtu>('m_rtus as rtu')
            .select(select)
            .innerJoin('m_locations as ml', function () {
                this.on('ml.id', 'rtu.id_m_location');
                this.onVal('ml.is_deleted', 0);
            })
            .innerJoin('m_mds as md', function () {
                this.on('md.id', 'rtu.id_m_md');
                this.onVal('ml.is_deleted', 0);
            })
            .where('rtu.is_deleted', 0);

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

        return new PaginationResponse<Rtu>(paging, count.total, datas);
    }
}