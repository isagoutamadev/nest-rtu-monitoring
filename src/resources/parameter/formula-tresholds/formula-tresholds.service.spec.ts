import { Test, TestingModule } from '@nestjs/testing';
import { FormulaTresholdsService } from './formula-tresholds.service';

describe('FormulaTresholdsService', () => {
  let service: FormulaTresholdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaTresholdsService],
    }).compile();

    service = module.get<FormulaTresholdsService>(FormulaTresholdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
