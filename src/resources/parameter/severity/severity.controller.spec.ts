import { Test, TestingModule } from '@nestjs/testing';
import { SeverityController } from './severity.controller';
import { SeverityService } from './severity.service';

describe('SeverityController', () => {
  let controller: SeverityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeverityController],
      providers: [SeverityService],
    }).compile();

    controller = module.get<SeverityController>(SeverityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
