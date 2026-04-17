import { PartialType } from '@nestjs/swagger';
import { CreateActivityReportsLineDto } from './create-activity-reports-line.dto';

export class UpdateActivityReportsLineDto extends PartialType(
  CreateActivityReportsLineDto,
) {}
