import { Module } from '@nestjs/common';
import { RrdService } from './rrd.service';
import { RrdController } from './rrd.controller';

@Module({
    controllers: [RrdController],
    providers: [RrdService],
})
export class RrdModule {}
