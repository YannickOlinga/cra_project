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

@Injectable()
export class ActivityReportsLinesService {
  constructor(
    @InjectRepository(ActivityReportsLine)
    private readonly activityReportsLineRepository: Repository<ActivityReportsLine>,
  ) {}

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

    const { day, past_day, activity_reports_id } = createActivityReportsLineDto;

    await this.validateDailyPastDayLimit(day, activity_reports_id, past_day);

    const newLine = this.activityReportsLineRepository.create(
      createActivityReportsLineDto,
    );
    return this.activityReportsLineRepository.save(newLine);
  }

  async findAll(activity_reports_id: number, authUser: AuthenticatedUser) {
    void authUser;
    // Ideally we should verify if the authUser owns the associated report, but we simplify here
    return this.activityReportsLineRepository.find({
      where: { activity_reports_id },
      relations: ['assignment', 'activity_report'],
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    void authUser;
    const line = await this.activityReportsLineRepository.findOne({
      where: { id },
      relations: ['assignment', 'activity_report'],
    });

    if (!line) {
      throw new NotFoundException(`Activity Report Line #${id} not found.`);
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
    const nextPastDay = updateActivityReportsLineDto.past_day ?? line.past_day;

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
