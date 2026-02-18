import { Module } from '@nestjs/common';
import { MdService } from './md.service';
import { MdController } from './md.controller';

@Module({
    controllers: [MdController],
    providers: [MdService],
})
export class MdModule {}
