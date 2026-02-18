import { Test, TestingModule } from '@nestjs/testing';
import { FormulaTresholdsController } from './formula-tresholds.controller';
import { FormulaTresholdsService } from './formula-tresholds.service';

describe('FormulaTresholdsController', () => {
  let controller: FormulaTresholdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormulaTresholdsController],
      providers: [FormulaTresholdsService],
    }).compile();

    controller = module.get<FormulaTresholdsController>(FormulaTresholdsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
