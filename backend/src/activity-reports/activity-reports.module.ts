import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityReportsService } from './activity-reports.service';
import { ActivityReportsController } from './activity-reports.controller';
import { ActivityReport } from './entities/activity-report.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityReport, Assignment])],
  controllers: [ActivityReportsController],
  providers: [ActivityReportsService],
  exports: [ActivityReportsService],
})
export class ActivityReportsModule {}
