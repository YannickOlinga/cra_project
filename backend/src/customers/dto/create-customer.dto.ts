import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  company: string;

  @IsInt()
  user_id: number;
}
