import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityReportsService } from './activity-reports.service';
import { ActivityReportsController } from './activity-reports.controller';
import { ActivityReport } from './entities/activity-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityReport])],
  controllers: [ActivityReportsController],
  providers: [ActivityReportsService],
  exports: [ActivityReportsService],
})
export class ActivityReportsModule {}
