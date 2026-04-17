import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ActivityReportsService } from './activity-reports.service';
import { CreateActivityReportDto } from './dto/create-activity-report.dto';
import { UpdateActivityReportDto } from './dto/update-activity-report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(AuthGuard)
@Controller('activity-reports')
export class ActivityReportsController {
  constructor(
    private readonly activityReportsService: ActivityReportsService,
  ) {}

  @Post()
  create(
    @Body() createActivityReportDto: CreateActivityReportDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsService.create(
      createActivityReportDto,
      authUser,
    );
  }

  @Get()
  findAll(@Authaccount() authUser: AuthenticatedUser) {
    return this.activityReportsService.findAll(authUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsService.findOne(id, authUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityReportDto: UpdateActivityReportDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsService.update(
      id,
      updateActivityReportDto,
      authUser,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsService.remove(id, authUser);
  }
}
