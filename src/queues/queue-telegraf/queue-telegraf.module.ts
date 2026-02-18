//Module
import { Global, Module } from '@nestjs/common';
import { QueueTelegrafService } from './queue-telegraf.service';
import { BullModule } from '@nestjs/bull';
import { Constant } from 'src/constants/constant';
import config from 'src/config/env';
import { QueueTelegrafProcess } from './queue-telegraf.process';
import { MdService } from 'src/resources/parameter/md/md.service';

@Global()
@Module({
    imports: [
        BullModule.registerQueueAsync({
            useFactory: () => {
                return {
                    redis: config().redis
                }
            },
            name: Constant.Q_TELEGRAF_CONFIG_MD
        })
    ],
    exports: [QueueTelegrafService],
    providers: [QueueTelegrafService, QueueTelegrafProcess, MdService],
})

export class QueueTelegrafModule {}
