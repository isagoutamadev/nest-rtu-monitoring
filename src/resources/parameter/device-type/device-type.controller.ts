import {
    Controller,
    Get,
} from '@nestjs/common';
import { DeviceTypeService } from './device-type.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Parameter Device Type')
@ApiBearerAuth('JWT')
@Controller('parameter/device-types')
@Controller('device-type')
export class DeviceTypeController {
    constructor(private readonly deviceTypeService: DeviceTypeService) {}
    @Get()
    findAll() {
        return this.deviceTypeService.findAll();
    }
}
