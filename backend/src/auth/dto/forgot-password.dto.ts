import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({ require_tld: false }, { message: 'Veuillez saisir une adresse e-mail valide.' })
  @MaxLength(255, { message: 'Veuillez saisir une adresse e-mail valide.' })
  email!: string;
}
