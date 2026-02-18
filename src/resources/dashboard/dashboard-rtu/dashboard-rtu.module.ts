import { Module } from '@nestjs/common';
import { DashboardRtuService } from './dashboard-rtu.service';
import { DashboardRtuController } from './dashboard-rtu.controller';
import { PrometheusModule } from 'src/utils/prometheus/promethues.module';

@Module({
    controllers: [DashboardRtuController],
    providers: [DashboardRtuService, PrometheusModule],
})
export class DashboardRtuModule {}
