import { Test, TestingModule } from '@nestjs/testing';
import { PortTresholdController } from './port-treshold.controller';
import { PortTresholdService } from './port-treshold.service';

describe('PortTresholdController', () => {
  let controller: PortTresholdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortTresholdController],
      providers: [PortTresholdService],
    }).compile();

    controller = module.get<PortTresholdController>(PortTresholdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
