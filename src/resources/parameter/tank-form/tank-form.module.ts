import { Module } from '@nestjs/common';
import { TankFormService } from './tank-form.service';
import { TankFormController } from './tank-form.controller';

@Module({
  controllers: [TankFormController],
  providers: [TankFormService],
})
export class TankFormModule {}
