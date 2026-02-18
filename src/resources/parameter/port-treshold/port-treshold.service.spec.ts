import { Test, TestingModule } from '@nestjs/testing';
import { PortTresholdService } from './port-treshold.service';

describe('PortTresholdService', () => {
  let service: PortTresholdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortTresholdService],
    }).compile();

    service = module.get<PortTresholdService>(PortTresholdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
