import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

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

  @IsOptional()
  @IsInt()
  assignments_id?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  assignment_ids?: number[];

  @IsOptional()
  @IsIn(['active', 'completed'])
  status?: 'active' | 'completed';
}
