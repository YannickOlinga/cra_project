import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({ require_tld: false }, { message: 'Veuillez saisir une adresse e-mail valide.' })
  @MinLength(3, { message: 'Veuillez saisir une adresse e-mail valide.' })
  email: string;

  @IsNotEmpty({ message: 'Veuillez saisir votre mot de passe.' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;
}
