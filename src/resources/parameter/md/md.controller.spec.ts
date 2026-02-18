import { Test, TestingModule } from '@nestjs/testing';
import { MdController } from './md.controller';
import { MdService } from './md.service';

describe('MdController', () => {
  let controller: MdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MdController],
      providers: [MdService],
    }).compile();

    controller = module.get<MdController>(MdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
