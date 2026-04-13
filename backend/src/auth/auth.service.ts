import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';
import { ProvidersService } from '../providers/providers.service';
import { AccountRole, RegisterAccountDto } from './dto/register-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
    private readonly providersService: ProvidersService,
  ) {}

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
