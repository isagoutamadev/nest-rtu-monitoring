import { Module } from '@nestjs/common';
import { PortTresholdService } from './port-treshold.service';
import { PortTresholdController } from './port-treshold.controller';
import { PortService } from '../port/port.service';

@Module({
    controllers: [PortTresholdController],
    providers: [PortTresholdService, PortService],
})
export class PortTresholdModule {}
