import { Test, TestingModule } from '@nestjs/testing';
import { MdService } from './md.service';

describe('MdService', () => {
  let service: MdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MdService],
    }).compile();

    service = module.get<MdService>(MdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
