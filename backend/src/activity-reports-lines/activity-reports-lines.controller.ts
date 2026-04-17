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
  Query,
} from '@nestjs/common';
import { ActivityReportsLinesService } from './activity-reports-lines.service';
import { CreateActivityReportsLineDto } from './dto/create-activity-reports-line.dto';
import { UpdateActivityReportsLineDto } from './dto/update-activity-reports-line.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(AuthGuard)
@Controller('activity-reports-lines')
export class ActivityReportsLinesController {
  constructor(
    private readonly activityReportsLinesService: ActivityReportsLinesService,
  ) {}

  @Post()
  create(
    @Body() createActivityReportsLineDto: CreateActivityReportsLineDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsLinesService.create(
      createActivityReportsLineDto,
      authUser,
    );
  }

  @Get()
  findAll(
    @Query('activity_report_id', ParseIntPipe) activityReportId: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsLinesService.findAll(activityReportId, authUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsLinesService.findOne(id, authUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityReportsLineDto: UpdateActivityReportsLineDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsLinesService.update(
      id,
      updateActivityReportsLineDto,
      authUser,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsLinesService.remove(id, authUser);
  }
}
