import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsController } from './activity-reports.controller';
import { ActivityReportsService } from './activity-reports.service';

describe('ActivityReportsController', () => {
  let controller: ActivityReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityReportsController],
      providers: [ActivityReportsService],
    }).compile();

    controller = module.get<ActivityReportsController>(ActivityReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
