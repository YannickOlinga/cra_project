import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateActivityReportDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  year: number;
}
