import { Test, TestingModule } from '@nestjs/testing';
import { RrdController } from './rrd.controller';
import { RrdService } from './rrd.service';

describe('RrdController', () => {
  let controller: RrdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RrdController],
      providers: [RrdService],
    }).compile();

    controller = module.get<RrdController>(RrdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
