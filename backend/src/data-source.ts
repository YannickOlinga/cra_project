import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ActivityReportsCost } from './activity-reports-costs/entities/activity-reports-cost.entity';
import { ActivityReportsLine } from './activity-reports-lines/entities/activity-reports-line.entity';
import { ActivityReport } from './activity-reports/entities/activity-report.entity';
import { Assignment } from './assignments/entities/assignment.entity';
import { Customer } from './customers/entities/customer.entity';
import { Provider } from './providers/entities/provider.entity';
import { User } from './users/entities/user.entity';

config();

export default new DataSource({
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
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
