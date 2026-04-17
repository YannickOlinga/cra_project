import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityReportDto } from './dto/create-activity-report.dto';
import { UpdateActivityReportDto } from './dto/update-activity-report.dto';
import { ActivityReport } from './entities/activity-report.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class ActivityReportsService {
  constructor(
    @InjectRepository(ActivityReport)
    private readonly activityReportsRepository: Repository<ActivityReport>,
  ) {}

  async create(
    createActivityReportDto: CreateActivityReportDto,
    authUser: AuthenticatedUser,
  ) {
    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException(
        'Only providers can create activity reports.',
      );
    }

    // Checking if a report for this month/year already exists for this provider
    const existingReport = await this.activityReportsRepository.findOne({
      where: {
        month: createActivityReportDto.month,
        year: createActivityReportDto.year,
        providers_id: authUser.profileId,
      },
    });

    if (existingReport) {
      throw new ConflictException(
        'An activity report already exists for this month and year.',
      );
    }

    const activityReport = this.activityReportsRepository.create({
      ...createActivityReportDto,
      providers_id: authUser.profileId,
    });

    return this.activityReportsRepository.save(activityReport);
  }

  async findAll(authUser: AuthenticatedUser) {
    const whereCondition: Partial<ActivityReport> = {};
    if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }
    // TODO: Si AccountRole.Customer, il faudrait filtrer pour ne renvoyer que les reports liés aux missions du Customer.

    return this.activityReportsRepository.find({
      where: whereCondition,
      relations: ['provider'], // ou ajouter les lignes de CRA si besoin
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const report = await this.activityReportsRepository.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!report) {
      throw new NotFoundException(`Activity Report #${id} not found.`);
    }

    // TODO: Verify if Customer has access to this report via an assignment
    if (
      authUser.role === AccountRole.Provider &&
      report.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only access your own reports.');
    }

    return report;
  }

  async update(
    id: number,
    updateActivityReportDto: UpdateActivityReportDto,
    authUser: AuthenticatedUser,
  ) {
    const report = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can update their reports.');
    }

    Object.assign(report, updateActivityReportDto);
    return this.activityReportsRepository.save(report);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const report = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can delete their reports.');
    }

    return this.activityReportsRepository.remove(report);
  }
}
