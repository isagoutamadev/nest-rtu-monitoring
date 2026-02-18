import { Test, TestingModule } from '@nestjs/testing';
import { RrdService } from './rrd.service';

describe('RrdService', () => {
  let service: RrdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RrdService],
    }).compile();

    service = module.get<RrdService>(RrdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
