//Module
import { Global, Module } from '@nestjs/common';
import { QueuePrometheusProcess } from './queue-prometheus.process';
import { BullModule } from '@nestjs/bull';
import { Constant } from 'src/constants/constant';
import config from 'src/config/env';
import { RrdService } from 'src/resources/parameter/rrd/rrd.service';
import { QueuePrometheusService } from './queue-prometheus.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
    imports: [
        BullModule.registerQueueAsync({
            useFactory: () => {
                return {
                    redis: config().redis
                }
            },
            name: Constant.Q_PROMETHEUS_CONFIG_RRD
        }),
        HttpModule
    ],
    exports: [QueuePrometheusService],
    providers: [QueuePrometheusService, QueuePrometheusProcess, RrdService],
})

export class QueuePrometheusModule {}
