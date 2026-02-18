import { Test, TestingModule } from '@nestjs/testing';
import { QueueTelegrafService } from './queue-telegraf.service';

describe('QueueTelegrafService', () => {
  let service: QueueTelegrafService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueTelegrafService],
    }).compile();

    service = module.get<QueueTelegrafService>(QueueTelegrafService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
