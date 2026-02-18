import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { PortTresholdService } from './port-treshold.service';
import { CreatePortTresholdDto } from './dto/create-port-treshold.dto';
import { UpdatePortTresholdDto } from './dto/update-port-treshold.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { PortService } from '../port/port.service';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';

@ApiTags('Parameter Port Treshold')
@ApiBearerAuth('JWT')
@Controller('parameter/ports/:portUuid/tresholds')
export class PortTresholdController {
    constructor(
        private readonly portService: PortService,
        private readonly portTresholdService: PortTresholdService
    ) {}

    @Post()
    async create(
        @AUTH() auth: User,
        @Param('portUuid', ParseUUIDPipe) portUuid: string,
        @Body() createPortTresholdDto: CreatePortTresholdDto) {
        const port = await this.portService.findOne(portUuid);
        return this.portTresholdService.create(port, createPortTresholdDto, auth);
    }

    @Get()
    findAll(
        @Param('portUuid', ParseUUIDPipe) portUuid: string,
        @Query() paging: PaginationDto,
    ) {
        return this.portTresholdService.findAll(paging, portUuid);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.portTresholdService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @AUTH() auth: User,
        @Param('portUuid', ParseUUIDPipe) portUuid: string,
        @Param('uuid') uuid: string,
        @Body() updatePortTresholdDto: UpdatePortTresholdDto,
    ) {
        const port = await this.portService.findOne(portUuid);
        return this.portTresholdService.update(uuid, updatePortTresholdDto, port, auth);
    }

    @Delete(':uuid')
    remove(
        @AUTH () auth: User, 
        @Param('uuid') uuid: string) 
    {
        return this.portTresholdService.remove(uuid, auth);
    }
}
