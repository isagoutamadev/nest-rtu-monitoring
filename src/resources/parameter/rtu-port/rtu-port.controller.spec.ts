import { Test, TestingModule } from '@nestjs/testing';
import { RtuPortController } from './rtu-port.controller';
import { RtuPortService } from './rtu-port.service';

describe('RtuPortController', () => {
  let controller: RtuPortController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RtuPortController],
      providers: [RtuPortService],
    }).compile();

    controller = module.get<RtuPortController>(RtuPortController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
