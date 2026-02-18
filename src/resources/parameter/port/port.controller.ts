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
    Put,
} from '@nestjs/common';
import { PortService } from './port.service';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { QueueTelegrafService } from 'src/queues/queue-telegraf/queue-telegraf.service';
import { QueuePrometheusService } from 'src/queues/queue-prometheus/queue-prometheus.service';
import { QueueTelegrafProcessType } from 'src/queues/queue-telegraf/queue-telegraf.process';
import { QueuePrometheusProcessType } from 'src/queues/queue-prometheus/queue-prometheus.process';
import { Md } from '../md/entities/md.entity';
import { Rrd } from '../rrd/entities/rrd.entity';

@ApiTags('Parameter Port')
@ApiBearerAuth('JWT')
@Controller('parameter/ports')
export class PortController {
    constructor(
        private readonly portService: PortService,
        private readonly queueTelegrafService: QueueTelegrafService,
        private readonly queuePrometheusService: QueuePrometheusService,
    ) {}

    @Post()
    create(@AUTH() auth, @Body() data: CreatePortDto) {
        return this.portService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.portService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.portService.findOne(uuid);
    }

    @Patch(':uuid')
    update(
        @AUTH() auth,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() data: UpdatePortDto,
    ) {
        return this.portService.update(uuid, data, auth);
    }

    @Put(':uuid/config')
    async updateConfig(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const port = await this.portService.findOne(uuid);
        const data = await this.portService.getDataForConfigUpdateByPortId(
            port.id,
        );
        const mdIds: number[] = data.map((item) => item.id_m_md);
        const rrdIds: number[] = [1];
        data.forEach((item) => {
            if (!rrdIds.includes(item.id_m_rrd)) {
                rrdIds.push(item.id_m_rrd);
            }
        });
        for (let i = 0; i < mdIds.length; i++) {
            const md = {
                id: mdIds[i]
            };
            
            await this.queueTelegrafService.addJob(QueueTelegrafProcessType.UPDATE, md as Md);
        }
        for (let i = 0; i < rrdIds.length; i++) {
            const rrd = {
                id: rrdIds[i]
            };
            await this.queuePrometheusService.addJob(QueuePrometheusProcessType.UPDATE, rrd as Rrd);
        }
        port.is_config_update_required = false;
        return port;
    }

    @Delete(':uuid')
    remove(@AUTH() auth, @Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.portService.remove(uuid, auth);
    }
}
