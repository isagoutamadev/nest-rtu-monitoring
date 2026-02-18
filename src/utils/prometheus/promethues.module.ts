//Module
import { Global, Module } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
    imports: [
        HttpModule
    ],
    exports: [PrometheusService],
    providers: [PrometheusService],
})

export class PrometheusModule {}
