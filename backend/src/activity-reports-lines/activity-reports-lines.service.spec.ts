import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsLinesService } from './activity-reports-lines.service';

describe('ActivityReportsLinesService', () => {
  let service: ActivityReportsLinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityReportsLinesService],
    }).compile();

    service = module.get<ActivityReportsLinesService>(ActivityReportsLinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
