import { Test, TestingModule } from '@nestjs/testing';
import { TankController } from './tank.controller';
import { TankService } from './tank.service';

describe('TankController', () => {
  let controller: TankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TankController],
      providers: [TankService],
    }).compile();

    controller = module.get<TankController>(TankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
