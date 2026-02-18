import { Test, TestingModule } from '@nestjs/testing';
import { BbmPricingController } from './bbm-pricing.controller';

describe('BbmPricingController', () => {
  let controller: BbmPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BbmPricingController],
    }).compile();

    controller = module.get<BbmPricingController>(BbmPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
