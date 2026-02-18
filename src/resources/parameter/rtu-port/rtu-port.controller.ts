import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UnprocessableEntityException,
} from '@nestjs/common';
import { RtuPortService } from './rtu-port.service';
import { CreateRtuPortDto } from './dto/create-rtu-port.dto';
import { UpdateRtuPortDto } from './dto/update-rtu-port.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { RtuService } from '../rtu/rtu.service';
import { PortService } from '../port/port.service';
import { validate } from 'class-validator';

@ApiTags('Parameter RTU Port')
@ApiBearerAuth('JWT')
@Controller('parameter/rtus/:rtuUuid/ports')
export class RtuPortController {
    constructor(
        private readonly rtuService: RtuService,
        private readonly portService: PortService,
        private readonly rtuPortService: RtuPortService,
    ) {}

    @Post()
    async create(@Param('rtuUuid') rtuUuid: string, @Body() data: CreateRtuPortDto, @AUTH() auth) {
        const rtu = await this.rtuService.findOne(rtuUuid);
        if (!rtu) {
            throw new UnprocessableEntityException('RTU tidak ditemukan');
        }
        const port = await this.portService.findById(data.id_m_port);
        if (!port) {
            throw new UnprocessableEntityException('Tipe Port tidak ditemukan');
        }
        // if (port.identifier = 'FUELTNK') {
        //     await validate(data.tank);
        // } else {
        //     delete data.tank;
        // }
        return this.rtuPortService.create(rtu, data, auth);
    }

    @Get()
    async findAll(@Param('rtuUuid') rtuUuid: string, @Query() paging: PaginationDto) {
        const rtu = await this.rtuService.findOne(rtuUuid);
        return this.rtuPortService.findAll(rtu, paging);
    }

    @Get(':uuid')
    findOne(@Param('rtuUuid') rtuUuid: string, @Param('uuid') uuid: string) {
        return this.rtuPortService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @Param('rtuUuid') rtuUuid: string,
        @Param('uuid') uuid: string,
        @Body() data: UpdateRtuPortDto,
        @AUTH() auth
    ) {
        const rtu = await this.rtuService.findOne(rtuUuid);
        return this.rtuPortService.update(rtu, uuid, data, auth);
    }

    @Delete(':uuid')
    remove(@Param('uuid') uuid: string) {
        return this.rtuPortService.remove(uuid);
    }
}
