import {
    Controller,
    Get,
    Query,
} from '@nestjs/common';
import { DashboardRtuService } from './dashboard-rtu.service';
import { PrometheusService } from 'src/utils/prometheus/prometheus.service';
import { RecordRtuStatus } from './entities/dashboard-rtu.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@Controller('dashboard/rtus')
export class DashboardRtuController {
    constructor(private readonly dashboardRtuService: DashboardRtuService, private readonly prometheus: PrometheusService) {}
    
    @ApiTags('Dashboard Rtu Operation', 'Dashboard Location Monitoring')
    @Get()
    async findAll(@Query() paging: PaginationDto) {
        const rtuRecordStatus: RecordRtuStatus = {};
        const [off, alert] = await Promise.all([
            await this.prometheus.query<{rtu_id: string}>(`count(ALERTS{rtu_id != "", alert_type="rtu"}) by (rtu_id)`),
            await this.prometheus.query<{rtu_id: string}>(`count(ALERTS{rtu_id != "", alert_type="port"}) by (rtu_id)`)
        ]);

        off.forEach((item) => {
            const rtuId = Number(item.metric.rtu_id);
            rtuRecordStatus[rtuId] = {
                id: rtuId,
                status: 'off'
            };
        });
        alert.forEach((item) => {
            const rtuId = Number(item.metric.rtu_id);
            rtuRecordStatus[rtuId] = {
                id: rtuId,
                status: 'alert'
            };
        });

        const result = await this.dashboardRtuService.findAll(paging);
        result.datas = result.datas.map(item => {
            return {
                ...item,
                status: rtuRecordStatus[item.id]?.status ?? 'normal' 
            }
        });

        return result;
    }
    
    @ApiTags('Dashboard Rtu Operation')
    @Get('port-and-formula')
    async getPortAndFormulaRtus(@Query() paging: PaginationDto) {
        const rtuRecordStatus: RecordRtuStatus = {};
        const [off, alert] = await Promise.all([
            await this.prometheus.query<{rtu_id: string}>(`count(ALERTS{rtu_id != "", alert_type="rtu"}) by (rtu_id)`),
            await this.prometheus.query<{rtu_id: string}>(`count(ALERTS{rtu_id != "", alert_type="port"}) by (rtu_id)`)
        ]);

        off.forEach((item) => {
            const rtuId = Number(item.metric.rtu_id);
            rtuRecordStatus[rtuId] = {
                id: rtuId,
                status: 'off'
            };
        });
        alert.forEach((item) => {
            const rtuId = Number(item.metric.rtu_id);
            rtuRecordStatus[rtuId] = {
                id: rtuId,
                status: 'alert'
            };
        });
        
        return this.dashboardRtuService.findAll(paging);
    }
}
