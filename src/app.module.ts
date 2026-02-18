import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './resources/administration/user/user.module';
import { OrganizationModule } from './resources/administration/organization/organization.module';
import { RoleModule } from './resources/administration/role/role.module';
import { PermissionModule } from './resources/administration/permission/permission.module';
import { LocationModule } from './resources/administration/location/location.module';
import { RrdModule } from './resources/parameter/rrd/rrd.module';
import { RtuModule } from './resources/parameter/rtu/rtu.module';
import { PortModule } from './resources/parameter/port/port.module';
import { TankModule } from './resources/parameter/tank/tank.module';
import { BbmPricingModule } from './resources/parameter/bbm-pricing/bbm-pricing.module';
import { FormulaModule } from './resources/parameter/formula/formula.module';
import { TagModule } from './resources/parameter/tag/tag.module';
import { KnexModule } from './utils/knex/knex.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { MdModule } from './resources/parameter/md/md.module';
import { RtuPortModule } from './resources/parameter/rtu-port/rtu-port.module';
import { ApiModule } from './resources/administration/api/api.module';
import { FormulaTresholdsModule } from './resources/parameter/formula-tresholds/formula-tresholds.module';
import { TankFormModule } from './resources/parameter/tank-form/tank-form.module';
import { BullModule } from '@nestjs/bull';
import { QueueTelegrafModule } from './queues/queue-telegraf/queue-telegraf.module';
import config from './config/env';
import { QueuePrometheusModule } from './queues/queue-prometheus/queue-prometheus.module';
import { PortTresholdModule } from './resources/parameter/port-treshold/port-treshold.module';
import { SeverityModule } from './resources/parameter/severity/severity.module';
import { DeviceTypeModule } from './resources/parameter/device-type/device-type.module';
import { DashboardRtuModule } from './resources/dashboard/dashboard-rtu/dashboard-rtu.module';
import { PrometheusModule } from './utils/prometheus/promethues.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config]
        }),
        UserModule,
        OrganizationModule,
        RoleModule,
        PermissionModule,
        LocationModule,
        RrdModule,
        RtuModule,
        PortModule,
        TankModule,
        BbmPricingModule,
        FormulaModule,
        TagModule,
        KnexModule,
        JwtModule.register({
            global: true,
            secret: config().jwt,
            signOptions: { expiresIn: '1d' },
        }),
        AuthModule,
        MdModule,
        RtuPortModule,
        ApiModule,
        FormulaTresholdsModule,
        TankFormModule,
        BullModule.forRootAsync({
            useFactory: () => {
                return {
                    redis: config().redis
                }
            }
        }),
        QueueTelegrafModule,
        QueuePrometheusModule,
        PortTresholdModule,
        SeverityModule,
        DeviceTypeModule,
        PrometheusModule,
        DashboardRtuModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(JwtMiddleware)
            .exclude(
                {
                    path: 'auth/login',
                    method: RequestMethod.POST,
                },
                {
                    path: 'auth/register',
                    method: RequestMethod.POST,
                },
            )
            .forRoutes('*');
    }
}
