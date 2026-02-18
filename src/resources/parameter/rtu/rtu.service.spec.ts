import { Test, TestingModule } from '@nestjs/testing';
import { RtuService } from './rtu.service';

describe('RtuService', () => {
  let service: RtuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtuService],
    }).compile();

    service = module.get<RtuService>(RtuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
