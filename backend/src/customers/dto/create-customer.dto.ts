import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(110)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  company?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  identifier?: string;

  @IsInt()
  @IsOptional()
  user_id: number;
}
