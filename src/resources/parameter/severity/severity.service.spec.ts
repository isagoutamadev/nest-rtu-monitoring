import { Test, TestingModule } from '@nestjs/testing';
import { SeverityService } from './severity.service';

describe('SeverityService', () => {
  let service: SeverityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeverityService],
    }).compile();

    service = module.get<SeverityService>(SeverityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
