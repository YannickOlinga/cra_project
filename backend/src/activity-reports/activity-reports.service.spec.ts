import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsService } from './activity-reports.service';

describe('ActivityReportsService', () => {
  let service: ActivityReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityReportsService],
    }).compile();

    service = module.get<ActivityReportsService>(ActivityReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
