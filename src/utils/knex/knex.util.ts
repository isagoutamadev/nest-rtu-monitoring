// src/nest-knex.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { KnexConfig, KnexConnection } from './knex.interface';
import Knex from 'knex';

interface IKnexUtil {
    getKnex();
}

@Injectable()
export class KnexUtil implements IKnexUtil {
    private readonly logger: Logger;
    private _knexConnection: KnexConnection;
    private _knexConfig: KnexConfig;

    constructor() {
        this._knexConfig = {
            client: process.env.DATABASE_CLIENT,
            connection: {
                host: process.env.DATABASE_HOST,
                port: Number(process.env.DATABASE_PORT),
                database: process.env.DATABASE_NAME,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
            },
        };

        this.logger = new Logger('KnexUtil');
        this.logger.log(`Options: ${JSON.stringify(this._knexConfig)}`);
    }

    getKnex(): KnexConnection {
        if (!this._knexConnection) {
            this._knexConnection = Knex(this._knexConfig);
            this.logger.log(`DB connection created`);
        }
        return this._knexConnection;
    }
}
