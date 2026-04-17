import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  ApiBearerAuth,
  ApiBasicAuth,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
@ApiBasicAuth()
@ApiBearerAuth()
@ApiResponse({
  status: 201,
  description: 'The assignment has been successfully created.',
})
@ApiResponse({ status: 400, description: 'Bad Request.' })
@ApiResponse({ status: 404, description: 'Not Found.' })
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@UseGuards(AuthGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('/')
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.assignmentsService.create(createAssignmentDto, auth);
  }

  @Get('/')
  @ApiOkResponse({
    description: 'List of assignments',
    type: [CreateAssignmentDto],
  })
  findAll(@Authaccount() auth: AuthenticatedUser) {
    return this.assignmentsService.findAll(auth);
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Assignment found',
    type: CreateAssignmentDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the assignment',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.assignmentsService.findOne(id, auth);
  }

  @Put('/:id')
  @ApiOkResponse({
    description: 'Assignment updated',
    type: CreateAssignmentDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto, auth);
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Assignment removed',
    type: CreateAssignmentDto,
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.assignmentsService.remove(id, auth);
  }
}
