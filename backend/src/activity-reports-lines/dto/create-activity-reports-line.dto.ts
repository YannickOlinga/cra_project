import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateActivityReportsLineDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hours: number;

  @IsNotEmpty()
  @IsInt()
  activity_reports_id: number;

  @IsNotEmpty()
  @IsInt()
  assignments_id: number;
}
