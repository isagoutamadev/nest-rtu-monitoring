import { Test, TestingModule } from '@nestjs/testing';
import { PortController } from './port.controller';
import { PortService } from './port.service';

describe('PortController', () => {
  let controller: PortController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortController],
      providers: [PortService],
    }).compile();

    controller = module.get<PortController>(PortController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
