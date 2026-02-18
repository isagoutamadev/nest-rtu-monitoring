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
import { RrdService } from './rrd.service';
import { CreateRrdDto } from './dto/create-rrd.dto';
import { UpdateRrdDto } from './dto/update-rrd.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { User } from 'src/resources/administration/user/entities/user.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';

@ApiTags('Parameter RRD')
@ApiBearerAuth('JWT')
@Controller('parameter/rrds')
export class RrdController {
    constructor(private readonly rrdService: RrdService) {}

    @Post()
    async create(
        @Body() data: CreateRrdDto,
        @AUTH() auth: User
    ) {
        return await this.rrdService.create(data, auth);
    }

    @Get()
    async findAll(@Query() paging: PaginationDto) {
        return await this.rrdService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.rrdService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() data: UpdateRrdDto,
        @AUTH() auth: User) {
        return await this.rrdService.update(uuid, data, auth);
    }

    @Delete(':uuid')
    remove(@Param('uuid', ParseUUIDPipe) uuid: string, @AUTH() auth: User) {
        return this.rrdService.remove(uuid, auth);
    }
}
