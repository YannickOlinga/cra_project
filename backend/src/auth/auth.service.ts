import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';
import { ProvidersService } from '../providers/providers.service';
import { MailService } from '../mail/mail.service';
import { RecaptchaService } from '../mail/recaptcha.service';
import { AccountRole, RegisterAccountDto } from './dto/register-account.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

import { Customer } from '../customers/entities/customer.entity';
import { Provider } from '../providers/entities/provider.entity';

type ResetPasswordPayload = {
  sub: number;
  email: string;
  purpose: 'reset-password';
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly providersService: ProvidersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly recaptchaService: RecaptchaService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const { password, ...safeUser } = user;
    const isPasswordValid = await bcrypt.compare(loginDto.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier si l'utilisateur est un client ou un prestataire
    let role = AccountRole.Customer;
    let profile: Customer | Provider | null = null;

    const customerProfile = await this.customersService.findOneByUserId(
      user.id,
    );
    if (customerProfile) {
      role = AccountRole.Customer;
      profile = customerProfile;
    } else {
      const providerProfile = await this.providersService.findOneByUserId(
        user.id,
      );
      if (providerProfile) {
        role = AccountRole.Provider;
        profile = providerProfile;
      }
    }

    if (!profile?.id) {
      throw new UnauthorizedException('No profile linked to this account');
    }

    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role,
      profileId: profile.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: safeUser,
      role,
      profile,
    };
  }

  async register(registerAccountDto: RegisterAccountDto, remoteIp: string) {
    await this.recaptchaService.verifyRegisterToken(
      registerAccountDto.recaptchaToken,
      remoteIp,
    );

    const user = await this.usersService.create({
      first_name: registerAccountDto.first_name,
      last_name: registerAccountDto.last_name,
      email: registerAccountDto.email,
      password: registerAccountDto.password,
    });

    if (registerAccountDto.role === AccountRole.Customer) {
      if (!registerAccountDto.company) {
        throw new BadRequestException('company is required for customers');
      }

      const customer = await this.customersService.create({
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        company: registerAccountDto.company,
        user_id: user.id,
      });

      const payload: AuthenticatedUser = {
        sub: user.id,
        email: user.email,
        role: AccountRole.Customer,
        profileId: customer.id,
      };

      await this.sendRegistrationConfirmationEmail(
        user.email,
        user.first_name,
      );

      return {
        access_token: await this.jwtService.signAsync(payload),
        role: AccountRole.Customer,
        user,
        profile: customer,
      };
    }

    const provider = await this.providersService.create({
      user_id: user.id,
    });

    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role: AccountRole.Provider,
      profileId: provider.id,
    };

    await this.sendRegistrationConfirmationEmail(user.email, user.first_name);

    return {
      access_token: await this.jwtService.signAsync(payload),
      role: AccountRole.Provider,
      user,
      profile: provider,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim();
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const expiresIn = (this.configService.get<string>(
        'RESET_PASSWORD_TOKEN_EXPIRES_IN',
      ) ?? '1h') as JwtSignOptions['expiresIn'];
      const token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          purpose: 'reset-password',
        } satisfies ResetPasswordPayload,
        { expiresIn },
      );

      await this.mailService.sendResetPasswordEmail(
        user.email,
        user.first_name,
        token,
      );
    }

    return {
      message:
        'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let payload: ResetPasswordPayload;

    try {
      payload = await this.jwtService.verifyAsync<ResetPasswordPayload>(
        resetPasswordDto.token,
      );
    } catch {
      throw new BadRequestException('Token de reinitialisation invalide');
    }

    if (payload.purpose !== 'reset-password') {
      throw new BadRequestException('Token de reinitialisation invalide');
    }

    await this.usersService.updatePassword(
      payload.sub,
      resetPasswordDto.password,
    );

    return {
      message: 'Mot de passe modifie avec succes',
    };
  }

  private async sendRegistrationConfirmationEmail(
    email: string,
    firstName: string,
  ) {
    try {
      await this.mailService.sendRegistrationConfirmationEmail(
        email,
        firstName,
      );
    } catch (error) {
      this.logger.error(
        `Impossible d'envoyer l'email de confirmation a ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
