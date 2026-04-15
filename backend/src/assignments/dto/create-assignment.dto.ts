import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsNumber()
  @IsNotEmpty()
  hourly_rate: number;

  @IsNumber()
  @IsNotEmpty()
  budget: number;

  @IsString()
  @IsOptional()
  label?: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  providers_id: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  customers_id: number;
}
