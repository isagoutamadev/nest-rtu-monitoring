import { Module } from '@nestjs/common';
import { BbmPricingController } from './bbm-pricing.controller';
import { BbmPricingService } from './bbm-pricing.service';

@Module({
  controllers: [BbmPricingController],
  providers: [BbmPricingService]
})
export class BbmPricingModule {}
