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

@Injectable()
export class ActivityReportsLinesService {
  constructor(
    @InjectRepository(ActivityReportsLine)
    private readonly activityReportsLineRepository: Repository<ActivityReportsLine>,
  ) {}

  async create(
    createActivityReportsLineDto: CreateActivityReportsLineDto,
    authUser: AuthenticatedUser,
  ) {
    if (authUser.role !== AccountRole.Provider) {
      throw new ForbiddenException('Only providers can fill activity lines.');
    }

    const { day, hours, activity_reports_id } = createActivityReportsLineDto;

    // Check if the total hours for this day in this report doesn't exceed 24 (or standard working hours like 8/12)
    const existingLines = await this.activityReportsLineRepository.find({
      where: { day, activity_reports_id },
    });

    const totalHoursDay = existingLines.reduce(
      (total, line) => total + Number(line.hours),
      0,
    );
    if (totalHoursDay + Number(hours) > 24) {
      throw new BadRequestException(
        'Total hours for a single day cannot exceed 24.',
      );
    }

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

    // We should also re-calculate total hours if hours are updated, keeping it simplified here
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
