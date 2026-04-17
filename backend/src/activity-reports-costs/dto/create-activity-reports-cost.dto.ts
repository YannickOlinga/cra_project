import { IsIn, IsInt, IsNumber, IsPositive, IsString } from 'class-validator';

const COST_CATEGORIES = ['transport', 'meal', 'hotel', 'other'] as const;

export class CreateActivityReportsCostDto {
  @IsInt()
  activity_reports_id: number;

  @IsString()
  label: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsString()
  @IsIn(COST_CATEGORIES)
  category: string;
}
