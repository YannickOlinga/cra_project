import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityReportsLinesService } from './activity-reports-lines.service';
import { ActivityReportsLinesController } from './activity-reports-lines.controller';
import { ActivityReportsLine } from './entities/activity-reports-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityReportsLine])],
  controllers: [ActivityReportsLinesController],
  providers: [ActivityReportsLinesService],
  exports: [ActivityReportsLinesService],
})
export class ActivityReportsLinesModule {}
