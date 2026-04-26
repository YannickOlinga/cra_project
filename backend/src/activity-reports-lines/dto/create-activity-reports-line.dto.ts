import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  IsEnum,
} from 'class-validator';
import { PastDay } from 'common/enums/past_day';

export class CreateActivityReportsLineDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @IsEnum(PastDay)
  @IsDefined()
  @ApiProperty({ enum: PastDay, enumName: 'past_day' })
  past_day: PastDay;

  @IsNotEmpty()
  @IsInt()
  activity_reports_id: number;

  @IsNotEmpty()
  @IsInt()
  assignments_id: number;
}
