import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityReportsLineDto } from './dto/create-activity-reports-line.dto';
import { UpdateActivityReportsLineDto } from './dto/update-activity-reports-line.dto';
import { ActivityReportsLine } from './entities/activity-reports-line.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PastDay } from 'common/enums/past_day';
import { ActivityReport } from '../activity-reports/entities/activity-report.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Injectable()
export class ActivityReportsLinesService {
  constructor(
    @InjectRepository(ActivityReportsLine)
    private readonly activityReportsLineRepository: Repository<ActivityReportsLine>,
    @InjectRepository(ActivityReport)
    private readonly activityReportsRepository: Repository<ActivityReport>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
  ) {}

  private getReportAssignmentIds(report: ActivityReport): number[] {
    return Array.from(
      new Set([
        ...(report.assignment_ids ?? []),
        ...(report.assignments_id ? [report.assignments_id] : []),
      ]),
    );
  }

  private async assertCanUseLine(
    activityReportId: number,
    assignmentId: number,
    authUser: AuthenticatedUser,
  ): Promise<void> {
    const report = await this.activityReportsRepository.findOne({
      where: { id: activityReportId },
    });

    if (!report) {
      throw new NotFoundException('Activity report not found.');
    }

    if (
      authUser.role !== AccountRole.Provider ||
      report.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only fill your own activity report.');
    }

    const assignment = await this.assignmentsRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.providers_id !== authUser.profileId) {
      throw new ForbiddenException('You can only use your own assignments.');
    }

    const allowedAssignmentIds = this.getReportAssignmentIds(report);
    if (
      allowedAssignmentIds.length > 0 &&
      !allowedAssignmentIds.includes(assignmentId)
    ) {
      throw new BadRequestException(
        'This assignment is not attached to the selected activity report.',
      );
    }
  }

  private async validateDailyPastDayLimit(
    day: number,
    activity_reports_id: number,
    past_day: PastDay,
    excludedLineId?: number,
  ) {
    const existingLines = await this.activityReportsLineRepository.find({
      where: { day, activity_reports_id },
    });

    const totalPastDay = existingLines.reduce((total, line) => {
      if (line.id === excludedLineId) {
        return total;
      }

      return total + Number(line.past_day);
    }, 0);

    if (totalPastDay + Number(past_day) > Number(PastDay.FULL)) {
      throw new BadRequestException(
        'Total past_day for a single day cannot exceed 1.',
      );
    }
  }

  async create(
    createActivityReportsLineDto: CreateActivityReportsLineDto,
    authUser: AuthenticatedUser,
  ) {
    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can fill activity lines.');
    }

    const { day, past_day, activity_reports_id, assignments_id } =
      createActivityReportsLineDto;

    await this.assertCanUseLine(activity_reports_id, assignments_id, authUser);
    await this.validateDailyPastDayLimit(day, activity_reports_id, past_day);

    const newLine = this.activityReportsLineRepository.create(
      createActivityReportsLineDto,
    );
    return this.activityReportsLineRepository.save(newLine);
  }

  async findAll(activity_reports_id: number, authUser: AuthenticatedUser) {
    const report = await this.activityReportsRepository.findOne({
      where: { id: activity_reports_id },
    });

    if (!report) {
      throw new NotFoundException('Activity report not found.');
    }

    if (
      authUser.role === AccountRole.Provider &&
      report.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only access your own activity lines.');
    }

    return this.activityReportsLineRepository.find({
      where: { activity_reports_id },
      relations: ['assignment', 'activity_report'],
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const line = await this.activityReportsLineRepository.findOne({
      where: { id },
      relations: ['assignment', 'activity_report'],
    });

    if (!line) {
      throw new NotFoundException(`Activity Report Line #${id} not found.`);
    }

    if (
      authUser.role === AccountRole.Provider &&
      line.activity_report.providers_id !== authUser.profileId
    ) {
      throw new ForbiddenException('You can only access your own activity lines.');
    }

    return line;
  }

  async update(
    id: number,
    updateActivityReportsLineDto: UpdateActivityReportsLineDto,
    authUser: AuthenticatedUser,
  ) {
    const line = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can update activity lines.');
    }

    const nextDay = updateActivityReportsLineDto.day ?? line.day;
    const nextActivityReportId =
      updateActivityReportsLineDto.activity_reports_id ??
      line.activity_reports_id;
    const nextAssignmentId =
      updateActivityReportsLineDto.assignments_id ?? line.assignments_id;
    const nextPastDay = updateActivityReportsLineDto.past_day ?? line.past_day;

    await this.assertCanUseLine(nextActivityReportId, nextAssignmentId, authUser);
    await this.validateDailyPastDayLimit(
      nextDay,
      nextActivityReportId,
      nextPastDay,
      line.id,
    );

    Object.assign(line, updateActivityReportsLineDto);
    return this.activityReportsLineRepository.save(line);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const line = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can delete activity lines.');
    }

    return this.activityReportsLineRepository.remove(line);
  }
}
