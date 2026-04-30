import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityReportsLinesService } from './activity-reports-lines.service';
import { ActivityReportsLinesController } from './activity-reports-lines.controller';
import { ActivityReportsLine } from './entities/activity-reports-line.entity';
import { ActivityReport } from '../activity-reports/entities/activity-report.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityReport, ActivityReportsLine, Assignment]),
  ],
  controllers: [ActivityReportsLinesController],
  providers: [ActivityReportsLinesService],
  exports: [ActivityReportsLinesService],
})
export class ActivityReportsLinesModule {}
