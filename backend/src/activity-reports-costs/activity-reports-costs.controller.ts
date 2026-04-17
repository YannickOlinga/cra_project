import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityReportsCostsService } from './activity-reports-costs.service';
import { CreateActivityReportsCostDto } from './dto/create-activity-reports-cost.dto';
import { UpdateActivityReportsCostDto } from './dto/update-activity-reports-cost.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(AuthGuard)
@Controller('activity-reports-costs')
export class ActivityReportsCostsController {
  constructor(
    private readonly activityReportsCostsService: ActivityReportsCostsService,
  ) {}

  @Post()
  create(
    @Body() createActivityReportsCostDto: CreateActivityReportsCostDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsCostsService.create(
      createActivityReportsCostDto,
      authUser,
    );
  }

  @Get()
  findAll(
    @Query('activity_report_id', ParseIntPipe) activityReportId: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsCostsService.findAll(activityReportId, authUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsCostsService.findOne(id, authUser);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityReportsCostDto: UpdateActivityReportsCostDto,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsCostsService.update(
      id,
      updateActivityReportsCostDto,
      authUser,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() authUser: AuthenticatedUser,
  ) {
    return this.activityReportsCostsService.remove(id, authUser);
  }
}
