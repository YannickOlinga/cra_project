import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MinLength(3)
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
