import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Customer } from './customers/entities/customer.entity';
import { Provider } from './providers/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5433),
      username: process.env.DATABASE_USER ?? 'TerenickDB',
      password: process.env.DATABASE_PASSWORD ?? 'TerenierT*',
      database: process.env.DATABASE_NAME ?? 'TerenickDB',
      entities: [User, Customer, Provider],
      synchronize: true,
    }),
    UsersModule,
    ProvidersModule,
    CustomersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
