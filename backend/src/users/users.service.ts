import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      typeof (error as { code?: string }).code === 'string' &&
      (error as { code?: string }).code === '23505'
    );
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create(rest);
    user.password = hashedPassword;

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.toSafeUser(savedUser);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'first_name', 'last_name'], // Explicitly select password
    });
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toSafeUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const existingUser = await this.usersRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      existingUser.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.first_name !== undefined) {
      existingUser.first_name = updateUserDto.first_name;
    }
    if (updateUserDto.last_name !== undefined) {
      existingUser.last_name = updateUserDto.last_name;
    }
    if (updateUserDto.email !== undefined) {
      existingUser.email = updateUserDto.email;
    }

    try {
      const savedUser = await this.usersRepository.save(existingUser);
      return this.toSafeUser(savedUser);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
    return { message: `User with ID ${id} deleted successfully` };
  }
}
