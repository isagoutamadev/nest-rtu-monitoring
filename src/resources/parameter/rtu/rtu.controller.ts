import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    NotFoundException,
    ParseUUIDPipe,
    Req,
    Put,
    UnprocessableEntityException,
} from '@nestjs/common';
import { RtuService } from './rtu.service';
import { CreateRtuDto } from './dto/create-rtu.dto';
import { UpdateRtuDto } from './dto/update-rtu.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { QueueTelegrafService } from 'src/queues/queue-telegraf/queue-telegraf.service';
import { QueueTelegrafProcessType } from 'src/queues/queue-telegraf/queue-telegraf.process';
import { SearchRtuDto } from './dto/search-rtu.dto';
import { QueuePrometheusService } from 'src/queues/queue-prometheus/queue-prometheus.service';
import { QueuePrometheusProcessType } from 'src/queues/queue-prometheus/queue-prometheus.process';

@ApiTags('Parameter RTU')
@ApiBearerAuth('JWT')
@Controller('parameter/rtus')
export class RtuController {
    constructor(
        private readonly rtuService: RtuService,
        private readonly queueTelegrafService: QueueTelegrafService,
        private readonly queuePrometheusService: QueuePrometheusService,
    ) {}

    @Post()
    create(@AUTH() auth, @Body() data: CreateRtuDto) {
        if (!this.rtuService.isValidSname(data.sname)) {
            throw new UnprocessableEntityException('Sname RTU tidak valid');
        }
        return this.rtuService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto, @Query() search: SearchRtuDto) {
        console.log(search);
        return this.rtuService.findAll(paging, search);
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        const detail = await this.rtuService.findOne(uuid);

        return detail;
    }

    @Put(':uuid/config')
    async generateConfig(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const rtu = await this.rtuService.findOne(uuid, true);

        this.queueTelegrafService.addJob(QueueTelegrafProcessType.UPDATE, rtu.md);
        this.queuePrometheusService.addJob(QueuePrometheusProcessType.UPDATE, rtu.md.rrd);

        rtu.is_config_update_required = false;
        return rtu;
    }

    @Patch(':uuid')
    update(
        @AUTH() auth,
        @Param('uuid') uuid: string,
        @Body() data: UpdateRtuDto,
    ) {
        if (!this.rtuService.isValidSname(data.sname)) {
            throw new UnprocessableEntityException('Sname RTU tidak valid');
        }
        return this.rtuService.update(uuid, data, auth);
    }

    @Delete(':uuid')
    remove(@Param('uuid') uuid: string) {
        return this.rtuService.remove(uuid);
    }
}
