import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsCostsController } from './activity-reports-costs.controller';
import { ActivityReportsCostsService } from './activity-reports-costs.service';

describe('ActivityReportsCostsController', () => {
  let controller: ActivityReportsCostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityReportsCostsController],
      providers: [ActivityReportsCostsService],
    }).compile();

    controller = module.get<ActivityReportsCostsController>(ActivityReportsCostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
