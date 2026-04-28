import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Assignment } from '../assignments/entities/assignment.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,

    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
  ) {}

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof (error as { code?: string }).code === 'string' &&
      (error as { code?: string }).code === '23505'
    );
  }

  async create(
    createCustomerDto: CreateCustomerDto,
    auth?: AuthenticatedUser,
  ): Promise<Customer> {
    const { user_id, company, identifier, name, email } = createCustomerDto;

    let user: User | null = null;

    if (user_id !== undefined) {
      user = await this.userRepository.findOne({ where: { id: user_id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
    } else {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
      const generatedPassword = await bcrypt.hash(randomUUID(), 10);

      user = this.userRepository.create({
        first_name: firstName || name.trim(),
        last_name: lastNameParts.join(' ') || '-',
        email,
        password: generatedPassword,
      });
      user = await this.userRepository.save(user);
    }

    const customer = this.customersRepository.create({
      company,
      identifier,
      user,
    });

    if (auth?.role === AccountRole.Provider) {
      const provider = await this.providersRepository.findOne({
        where: { id: auth.profileId },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${auth.profileId} not found`);
      }

      customer.provider = provider;
    }

    try {
      return await this.customersRepository.save(customer);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Customer identifier already exists');
      }
      throw error;
    }
  }

  async findAll(auth: AuthenticatedUser): Promise<Customer[]> {
    if (auth.role === AccountRole.Customer) {
      return this.customersRepository.find({
        where: { id: auth.profileId },
        relations: ['user'],
      });
    }

    if (auth.role === AccountRole.Provider) {
      return this.customersRepository
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.user', 'user')
        .leftJoin('customer.provider', 'ownerProvider')
        .leftJoin(
          Assignment,
          'assignment',
          'assignment.customers_id = customer.id AND assignment.providers_id = :providerId',
          { providerId: auth.profileId },
        )
        .where('ownerProvider.id = :providerId', { providerId: auth.profileId })
        .orWhere('assignment.id IS NOT NULL')
        .orderBy('customer.id', 'DESC')
        .getMany();
    }

    return [];
  }

  async findOneByUserId(userId: number): Promise<Customer | null> {
    return this.customersRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number, auth?: AuthenticatedUser): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['user', 'provider'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    if (auth) {
      await this.assertCanAccessCustomer(customer, auth);
    }
    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
    auth?: AuthenticatedUser,
  ): Promise<Customer> {
    const customer = await this.findOne(id, auth);

    if (updateCustomerDto.name !== undefined) {
      const trimmedName = updateCustomerDto.name.trim();
      const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
      customer.user.first_name = firstName || trimmedName;
      customer.user.last_name = lastNameParts.join(' ') || '-';
    }

    if (updateCustomerDto.email !== undefined) {
      const trimmedEmail = updateCustomerDto.email.trim();
      const existingUser = await this.userRepository.findOne({
        where: { email: trimmedEmail },
      });

      if (existingUser && existingUser.id !== customer.user.id) {
        throw new ConflictException('Email already exists');
      }

      customer.user.email = trimmedEmail;
    }

    if (updateCustomerDto.company !== undefined) {
      customer.company = updateCustomerDto.company || undefined;
    }

    if (updateCustomerDto.identifier !== undefined) {
      customer.identifier = updateCustomerDto.identifier || undefined;
    }

    if (updateCustomerDto.user_id !== undefined) {
      const user = await this.userRepository.findOne({
        where: { id: updateCustomerDto.user_id },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateCustomerDto.user_id} not found`,
        );
      }

      customer.user = user;
    }

    try {
      await this.userRepository.save(customer.user);
      return await this.customersRepository.save(customer);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Customer identifier already exists');
      }
      throw error;
    }
  }

  async remove(id: number, auth?: AuthenticatedUser): Promise<void> {
    const customer = await this.findOne(id, auth);
    await this.customersRepository.remove(customer);

    return;
  }

  private async assertCanAccessCustomer(
    customer: Customer,
    auth: AuthenticatedUser,
  ): Promise<void> {
    if (auth.role === AccountRole.Customer && customer.id === auth.profileId) {
      return;
    }

    if (auth.role === AccountRole.Provider) {
      if (customer.provider?.id === auth.profileId) {
        return;
      }

      const assignment = await this.assignmentsRepository.findOne({
        where: {
          customers_id: customer.id,
          providers_id: auth.profileId,
        },
      });

      if (assignment) {
        return;
      }
    }

    throw new ForbiddenException("Vous n'avez pas acces a ce client.");
  }
}
