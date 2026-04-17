import { Test, TestingModule } from '@nestjs/testing';
import { ActivityReportsLinesController } from './activity-reports-lines.controller';
import { ActivityReportsLinesService } from './activity-reports-lines.service';

describe('ActivityReportsLinesController', () => {
  let controller: ActivityReportsLinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityReportsLinesController],
      providers: [ActivityReportsLinesService],
    }).compile();

    controller = module.get<ActivityReportsLinesController>(ActivityReportsLinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
