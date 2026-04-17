import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityReportsCostDto } from './dto/create-activity-reports-cost.dto';
import { UpdateActivityReportsCostDto } from './dto/update-activity-reports-cost.dto';
import { ActivityReportsCost } from './entities/activity-reports-cost.entity';
import { ActivityReport } from '../activity-reports/entities/activity-report.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class ActivityReportsCostsService {
  constructor(
    @InjectRepository(ActivityReportsCost)
    private readonly activityReportsCostsRepository: Repository<ActivityReportsCost>,
    @InjectRepository(ActivityReport)
    private readonly activityReportsRepository: Repository<ActivityReport>,
  ) {}

  private async getOwnedActivityReport(
    activityReportId: number,
    authUser: AuthenticatedUser,
  ): Promise<ActivityReport> {
    const report = await this.activityReportsRepository.findOne({
      where: { id: activityReportId },
    });

    if (!report) {
      throw new NotFoundException(
        `Activity Report #${activityReportId} not found.`,
      );
    }

    if (
      authUser.role !== AccountRole.Provider ||
      report.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException(
        'You can only manage costs for your own activity reports.',
      );
    }

    return report;
  }

  async create(
    createActivityReportsCostDto: CreateActivityReportsCostDto,
    authUser: AuthenticatedUser,
  ) {
    await this.getOwnedActivityReport(
      createActivityReportsCostDto.activity_reports_id,
      authUser,
    );

    const cost = this.activityReportsCostsRepository.create(
      createActivityReportsCostDto,
    );

    return this.activityReportsCostsRepository.save(cost);
  }

  async findAll(activityReportId: number, authUser: AuthenticatedUser) {
    await this.getOwnedActivityReport(activityReportId, authUser);

    return this.activityReportsCostsRepository.find({
      where: { activity_reports_id: activityReportId },
      relations: ['activity_report'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const cost = await this.activityReportsCostsRepository.findOne({
      where: { id },
      relations: ['activity_report'],
    });

    if (!cost) {
      throw new NotFoundException(`Activity Report Cost #${id} not found.`);
    }

    await this.getOwnedActivityReport(cost.activity_reports_id, authUser);

    return cost;
  }

  async update(
    id: number,
    updateActivityReportsCostDto: UpdateActivityReportsCostDto,
    authUser: AuthenticatedUser,
  ) {
    const cost = await this.findOne(id, authUser);

    if (
      updateActivityReportsCostDto.activity_reports_id &&
      updateActivityReportsCostDto.activity_reports_id !==
        cost.activity_reports_id
    ) {
      await this.getOwnedActivityReport(
        updateActivityReportsCostDto.activity_reports_id,
        authUser,
      );
    }

    Object.assign(cost, updateActivityReportsCostDto);
    return this.activityReportsCostsRepository.save(cost);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const cost = await this.findOne(id, authUser);
    return this.activityReportsCostsRepository.remove(cost);
  }
}
