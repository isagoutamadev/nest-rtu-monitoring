import { Module } from '@nestjs/common';
import { RtuPortService } from './rtu-port.service';
import { RtuPortController } from './rtu-port.controller';
import { RtuService } from '../rtu/rtu.service';
import { PortService } from '../port/port.service';

@Module({
  controllers: [RtuPortController],
  providers: [RtuPortService, RtuService, PortService],
})
export class RtuPortModule {}
