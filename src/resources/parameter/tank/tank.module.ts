import { Module } from '@nestjs/common';
import { TankService } from './tank.service';
import { TankController } from './tank.controller';

@Module({
    controllers: [TankController],
    providers: [TankService],
})
export class TankModule {}
