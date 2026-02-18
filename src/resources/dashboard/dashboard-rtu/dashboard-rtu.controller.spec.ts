import { Test, TestingModule } from '@nestjs/testing';
import { DashboardRtuController } from './dashboard-rtu.controller';
import { DashboardRtuService } from './dashboard-rtu.service';

describe('DashboardRtuController', () => {
  let controller: DashboardRtuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardRtuController],
      providers: [DashboardRtuService],
    }).compile();

    controller = module.get<DashboardRtuController>(DashboardRtuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
