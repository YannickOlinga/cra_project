import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CustomersModule } from '../customers/customers.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [UsersModule, CustomersModule, ProvidersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
