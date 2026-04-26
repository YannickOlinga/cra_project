import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { Assignment } from './assignments/entities/assignment.entity';
import { ActivityReport } from './activity-reports/entities/activity-report.entity';
import { ActivityReportsCost } from './activity-reports-costs/entities/activity-reports-cost.entity';
import { ActivityReportsLine } from './activity-reports-lines/entities/activity-reports-line.entity';
import { AssignmentsModule } from './assignments/assignments.module';
import { ActivityReportsModule } from './activity-reports/activity-reports.module';
import { ActivityReportsCostsModule } from './activity-reports-costs/activity-reports-costs.module';
import { ActivityReportsLinesModule } from './activity-reports-lines/activity-reports-lines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rends les variables d'environnement globales
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5433),
      username: process.env.DATABASE_USER ?? 'TerenickDB',
      password: process.env.DATABASE_PASSWORD ?? 'TerenierT*',
      database: process.env.DATABASE_NAME ?? 'TerenickDB',
      entities: [
        User,
        Customer,
        Provider,
        Assignment,
        ActivityReport,
        ActivityReportsCost,
        ActivityReportsLine,
      ],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    }),
    UsersModule,
    ProvidersModule,
    CustomersModule,
    AuthModule,
    AssignmentsModule,
    ActivityReportsModule,
    ActivityReportsCostsModule,
    ActivityReportsLinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
