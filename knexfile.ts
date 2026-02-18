import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();

const config = {
    client: process.env.DATABASE_CLIENT,
    connection: {
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    },
    migrations: {
        tableName: 'migrations',
        directory: __dirname + '/database/migrations',
    },
    seeds: {
        directory: __dirname + '/database/seeds',
    },
};

module.exports = config;
