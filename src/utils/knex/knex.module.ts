//Module
import { Global, Module } from '@nestjs/common';
import { KnexUtil } from './knex.util';

@Global()
@Module({
    imports: [],
    exports: [KnexUtil],
    providers: [KnexUtil],
})

export class KnexModule {}
