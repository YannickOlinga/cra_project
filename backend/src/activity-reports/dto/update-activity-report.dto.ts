import { PartialType } from '@nestjs/swagger';
import { CreateActivityReportDto } from './create-activity-report.dto';

export class UpdateActivityReportDto extends PartialType(
  CreateActivityReportDto,
) {}
