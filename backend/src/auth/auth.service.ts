import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';
import { ProvidersService } from '../providers/providers.service';
import { AccountRole, RegisterAccountDto } from './dto/register-account.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

import { Customer } from '../customers/entities/customer.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly providersService: ProvidersService,
    private readonly jwtService: JwtService,
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

    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role,
      profileId: profile?.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: safeUser,
      role,
      profile,
    };
  }

  async register(registerAccountDto: RegisterAccountDto) {
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
        company: registerAccountDto.company,
        user_id: user.id,
      });

      return {
        role: AccountRole.Customer,
        user,
        customer,
      };
    }

    const provider = await this.providersService.create({
      user_id: user.id,
    });

    return {
      role: AccountRole.Provider,
      user,
      provider,
    };
  }
}
