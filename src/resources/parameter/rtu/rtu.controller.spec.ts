import { Test, TestingModule } from '@nestjs/testing';
import { RtuController } from './rtu.controller';
import { RtuService } from './rtu.service';

describe('RtuController', () => {
  let controller: RtuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RtuController],
      providers: [RtuService],
    }).compile();

    controller = module.get<RtuController>(RtuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
