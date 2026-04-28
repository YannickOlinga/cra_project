import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ActivityReport } from '../activity-reports/entities/activity-report.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
    @InjectRepository(ActivityReport)
    private readonly activityReportsRepository: Repository<ActivityReport>,
  ) {}

  private getReportAssignmentIds(report: ActivityReport): number[] {
    return Array.from(
      new Set([
        ...(report.assignment_ids ?? []),
        ...(report.assignments_id ? [report.assignments_id] : []),
      ]),
    );
  }

  async create(
    createAssignmentDto: CreateAssignmentDto,
    authUser: AuthenticatedUser,
  ) {
    if (
      createAssignmentDto.hourly_rate <= 0 ||
      createAssignmentDto.budget <= 0
    ) {
      throw new BadRequestException(
        'Hourly rate and budget must be strictly positive.',
      );
    }
    if (createAssignmentDto.budget < createAssignmentDto.hourly_rate) {
      throw new BadRequestException(
        'Budget cannot be lower than the hourly rate.',
      );
    }

    let { customers_id, providers_id } = createAssignmentDto;

    // Forcer le client ou le prestataire en fonction du rôle
    if (authUser.role === AccountRole.Customer) {
      customers_id = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      providers_id = authUser.profileId;
    }

    const assignment = this.assignmentsRepository.create({
      ...createAssignmentDto,
      customers_id,
      providers_id,
    });

    const savedAssignment = await this.assignmentsRepository.save(assignment);

    return this.assignmentsRepository.findOne({
      where: { id: savedAssignment.id },
      relations: ['provider', 'customer'],
    });
  }

  async findAll(authUser: AuthenticatedUser) {
    const whereCondition: Partial<Assignment> = {};
    if (authUser.role === AccountRole.Customer) {
      whereCondition['customers_id'] = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }

    return this.assignmentsRepository.find({
      where: whereCondition,
      relations: ['provider', 'customer'],
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const whereCondition: Partial<Assignment> = { id };
    if (authUser.role === AccountRole.Customer) {
      whereCondition['customers_id'] = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }

    const assignment = await this.assignmentsRepository.findOne({
      where: whereCondition,
      relations: ['provider', 'customer'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${id} not found or you don't have access`,
      );
    }
    return assignment;
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
    authUser: AuthenticatedUser,
  ) {
    const assignment = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Customer) {
      throw new ForbiddenException('Only customers can update assignments.');
    }

    // Empêcher le changement d'acteurs
    if (
      updateAssignmentDto.customers_id !== undefined ||
      updateAssignmentDto.providers_id !== undefined
    ) {
      throw new BadRequestException(
        'Cannot change customer or provider after creation.',
      );
    }

    Object.assign(assignment, updateAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const assignment = await this.findOne(id, authUser);

    if (
      authUser.role !== AccountRole.Customer &&
      authUser.role !== AccountRole.Provider
    ) {
      throw new ForbiddenException('Only assignment owners can delete assignments.');
    }

    if (
      authUser.role === AccountRole.Provider &&
      assignment.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only delete your own assignments.');
    }

    if (
      authUser.role === AccountRole.Customer &&
      assignment.customers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only delete your own assignments.');
    }

    const providerReports = await this.activityReportsRepository.find({
      where: { providers_id: assignment.providers_id },
    });

    await Promise.all(
      providerReports.map(async (report) => {
        const assignmentIds = this.getReportAssignmentIds(report);

        if (!assignmentIds.includes(assignment.id)) {
          return report;
        }

        const nextAssignmentIds = assignmentIds.filter(
          (assignmentId) => assignmentId !== assignment.id,
        );

        if (nextAssignmentIds.length === 0) {
          return this.activityReportsRepository.remove(report);
        }

        report.assignment_ids = nextAssignmentIds;
        report.assignments_id = nextAssignmentIds.includes(
          Number(report.assignments_id),
        )
          ? report.assignments_id
          : nextAssignmentIds[0];

        return this.activityReportsRepository.save(report);
      }),
    );

    return this.assignmentsRepository.remove(assignment);
  }
}
