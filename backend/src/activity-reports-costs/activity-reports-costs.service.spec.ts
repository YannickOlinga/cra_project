import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsCostsService } from './activity-reports-costs.service';

describe('ActivityReportsCostsService', () => {
  let service: ActivityReportsCostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityReportsCostsService],
    }).compile();

    service = module.get<ActivityReportsCostsService>(ActivityReportsCostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
