import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexUtil } from 'src/utils/knex/knex.util';
import { PaginationResponse } from 'src/utils/pagination/pagination.response';

@Injectable()
export class DeviceTypeService {
    private readonly db: Knex;

    constructor(private readonly knexUtil: KnexUtil) {
        this.db = this.knexUtil.getKnex();
    }

    async findAll() {
        const query = this.db('m_device_type').select("id", "name");

        const datas = await query;

        return new PaginationResponse({}, datas.length, datas);
    }
}
