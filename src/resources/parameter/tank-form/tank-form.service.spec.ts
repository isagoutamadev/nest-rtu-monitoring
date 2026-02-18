import { Test, TestingModule } from '@nestjs/testing';
import { TankFormService } from './tank-form.service';

describe('TankFormService', () => {
  let service: TankFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TankFormService],
    }).compile();

    service = module.get<TankFormService>(TankFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
