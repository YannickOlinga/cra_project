import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { user_id, company } = createCustomerDto;
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const customer = this.customersRepository.create({
      company,
      user,
    });

    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (updateCustomerDto.company !== undefined) {
      customer.company = updateCustomerDto.company;
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

    return this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);

    return;
  }
}
