import { Module } from '@nestjs/common';
import { SeverityService } from './severity.service';
import { SeverityController } from './severity.controller';

@Module({
    controllers: [SeverityController],
    providers: [SeverityService],
})
export class SeverityModule {}
