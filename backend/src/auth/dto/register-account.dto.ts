import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum AccountRole {
  Customer = 'customer',
  Provider = 'provider',
}

export class RegisterAccountDto {
  @IsEnum(AccountRole)
  role!: AccountRole;

  @IsString()
  @MinLength(2)
  @MaxLength(55)
  first_name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(55)
  last_name!: string;

  @IsEmail()
  @MaxLength(30)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  recaptchaToken!: string;

  @ValidateIf(
    (payload: Record<string, any>) => payload.role === AccountRole.Customer,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  company?: string;
}
