import { Test, TestingModule } from '@nestjs/testing';
import { BbmPricingService } from './bbm-pricing.service';

describe('BbmPricingService', () => {
  let service: BbmPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BbmPricingService],
    }).compile();

    service = module.get<BbmPricingService>(BbmPricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
