import { Module } from '@nestjs/common';
import { DeviceTypeService } from './device-type.service';
import { DeviceTypeController } from './device-type.controller';

@Module({
    controllers: [DeviceTypeController],
    providers: [DeviceTypeService],
})
export class DeviceTypeModule {}
