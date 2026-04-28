import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateActivityReportDto } from './dto/create-activity-report.dto';
import { UpdateActivityReportDto } from './dto/update-activity-report.dto';
import { ActivityReport } from './entities/activity-report.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Assignment } from '../assignments/entities/assignment.entity';

@Injectable()
export class ActivityReportsService {
  constructor(
    @InjectRepository(ActivityReport)
    private readonly activityReportsRepository: Repository<ActivityReport>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
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

    const assignmentIds = Array.from(
      new Set([
        ...(createActivityReportDto.assignment_ids ?? []),
        ...(createActivityReportDto.assignments_id
          ? [createActivityReportDto.assignments_id]
          : []),
      ]),
    );

    if (assignmentIds.length === 0) {
      throw new BadRequestException(
        'At least one assignment is required to create an activity report.',
      );
    }

    const assignments = await this.assignmentsRepository.find({
      where: assignmentIds.map((id) => ({ id })),
    });

    if (assignments.length !== assignmentIds.length) {
      throw new NotFoundException('One or more assignments were not found.');
    }

    const hasForeignAssignment = assignments.some(
      (assignment) => assignment.providers_id !== authUser.profileId,
    );

    if (hasForeignAssignment) {
      throw new BadRequestException(
        'You can only create an activity report for your own assignments.',
      );
    }

    // One provider has one monthly CRA. Missions are attached to that report.
    const existingReport = await this.activityReportsRepository.findOne({
      where: {
        month: createActivityReportDto.month,
        year: createActivityReportDto.year,
        providers_id: authUser.profileId,
      },
    });

    if (existingReport) {
      const existingAssignmentIds = this.getReportAssignmentIds(existingReport);
      existingReport.assignment_ids = Array.from(
        new Set([...existingAssignmentIds, ...assignmentIds]),
      );
      existingReport.assignments_id =
        existingReport.assignments_id ?? existingReport.assignment_ids[0] ?? null;

      return this.activityReportsRepository.save(existingReport);
    }

    const activityReport = this.activityReportsRepository.create({
      month: createActivityReportDto.month,
      year: createActivityReportDto.year,
      providers_id: authUser.profileId,
      assignments_id: assignmentIds[0] ?? null,
      assignment_ids: assignmentIds,
    });

    return this.activityReportsRepository.save(activityReport);
  }

  async findAll(authUser: AuthenticatedUser) {
    const whereCondition: FindOptionsWhere<ActivityReport> = {};
    if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }
    // TODO: Si AccountRole.Customer, il faudrait filtrer pour ne renvoyer que les reports liés aux missions du Customer.

    return this.activityReportsRepository.find({
      where: whereCondition,
      relations: ['provider', 'assignment'],
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const report = await this.activityReportsRepository.findOne({
      where: { id },
      relations: ['provider', 'assignment'],
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

    if (
      updateActivityReportDto.assignment_ids ||
      updateActivityReportDto.assignments_id
    ) {
      const assignmentIds = Array.from(
        new Set([
          ...(updateActivityReportDto.assignment_ids ?? []),
          ...(updateActivityReportDto.assignments_id
            ? [updateActivityReportDto.assignments_id]
            : []),
        ]),
      );

      if (assignmentIds.length > 0) {
        const assignments = await this.assignmentsRepository.find({
          where: assignmentIds.map((assignmentId) => ({ id: assignmentId })),
        });

        if (assignments.length !== assignmentIds.length) {
          throw new NotFoundException('One or more assignments were not found.');
        }

        const hasForeignAssignment = assignments.some(
          (assignment) => assignment.providers_id !== authUser.profileId,
        );

        if (hasForeignAssignment) {
          throw new BadRequestException(
            'You can only attach your own assignments to an activity report.',
          );
        }

        report.assignment_ids = assignmentIds;
        report.assignments_id = assignmentIds[0];
      }
    }

    return this.activityReportsRepository.save(report);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const report = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can delete their reports.');
    }

    return this.activityReportsRepository.remove(report);
  }

  private getReportAssignmentIds(report: ActivityReport): number[] {
    return Array.from(
      new Set([
        ...(report.assignment_ids ?? []),
        ...(report.assignments_id ? [report.assignments_id] : []),
      ]),
    );
  }
}
