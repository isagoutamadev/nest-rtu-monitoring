import { Test, TestingModule } from '@nestjs/testing';
import { TankFormController } from './tank-form.controller';
import { TankFormService } from './tank-form.service';

describe('TankFormController', () => {
  let controller: TankFormController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TankFormController],
      providers: [TankFormService],
    }).compile();

    controller = module.get<TankFormController>(TankFormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
