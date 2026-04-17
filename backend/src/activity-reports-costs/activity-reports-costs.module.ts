import { Module } from '@nestjs/common';
import { ActivityReportsCostsService } from './activity-reports-costs.service';
import { ActivityReportsCostsController } from './activity-reports-costs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityReportsCost } from './entities/activity-reports-cost.entity';
import { ActivityReport } from '../activity-reports/entities/activity-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityReportsCost, ActivityReport])],
  controllers: [ActivityReportsCostsController],
  providers: [ActivityReportsCostsService],
  exports: [ActivityReportsCostsService],
})
export class ActivityReportsCostsModule {}
