import { Module } from '@nestjs/common';
import { RtuService } from './rtu.service';
import { RtuController } from './rtu.controller';

@Module({
    controllers: [RtuController],
    providers: [RtuService],
})
export class RtuModule {}
