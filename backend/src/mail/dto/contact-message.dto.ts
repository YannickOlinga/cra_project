import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ContactMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail({ require_tld: false }, { message: 'Veuillez saisir une adresse e-mail valide.' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(3000)
  message!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  recaptchaToken!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
