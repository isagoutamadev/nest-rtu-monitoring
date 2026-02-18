import { Test, TestingModule } from '@nestjs/testing';
import { RtuPortService } from './rtu-port.service';

describe('RtuPortService', () => {
  let service: RtuPortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtuPortService],
    }).compile();

    service = module.get<RtuPortService>(RtuPortService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
