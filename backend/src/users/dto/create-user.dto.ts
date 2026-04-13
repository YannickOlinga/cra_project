import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(55)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(55)
  last_name: string;

  @IsEmail()
  @MaxLength(30)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
