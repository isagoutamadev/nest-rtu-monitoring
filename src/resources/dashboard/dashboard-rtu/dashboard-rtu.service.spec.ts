import { Test, TestingModule } from '@nestjs/testing';
import { DashboardRtuService } from './dashboard-rtu.service';

describe('DashboardRtuService', () => {
  let service: DashboardRtuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardRtuService],
    }).compile();

    service = module.get<DashboardRtuService>(DashboardRtuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
