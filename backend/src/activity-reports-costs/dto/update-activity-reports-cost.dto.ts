import { PartialType } from '@nestjs/swagger';
import { CreateActivityReportsCostDto } from './create-activity-reports-cost.dto';

export class UpdateActivityReportsCostDto extends PartialType(
  CreateActivityReportsCostDto,
) {}
