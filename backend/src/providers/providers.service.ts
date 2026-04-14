import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const user = await this.userRepository.findOne({
      where: { id: createProviderDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createProviderDto.user_id} not found`,
      );
    }

    const provider = this.providersRepository.create({
      user,
    });

    return this.providersRepository.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return this.providersRepository.find({
      relations: ['user'],
    });
  }

  async findOneByUserId(userId: number): Promise<Provider | null> {
    return this.providersRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.providersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  async update(
    id: number,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    const provider = await this.providersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    if (updateProviderDto.user_id !== undefined) {
      const user = await this.userRepository.findOne({
        where: { id: updateProviderDto.user_id },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateProviderDto.user_id} not found`,
        );
      }

      provider.user = user;
    }

    return this.providersRepository.save(provider);
  }

  async remove(id: number): Promise<void> {
    const provider = await this.findOne(id);
    await this.providersRepository.remove(provider);
  }
}
