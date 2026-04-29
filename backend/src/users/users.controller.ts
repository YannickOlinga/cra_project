import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Provider } from '../providers/entities/provider.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiResponse({
  status: 201,
  description: 'The user has been successfully created.',
})
@ApiResponse({ status: 400, description: 'Bad Request.' })
@ApiResponse({ status: 404, description: 'Not Found.' })
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiBearerAuth()
@ApiBasicAuth()
@ApiExtraModels(Provider, Customer)
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/')
  @ApiOkResponse({ description: 'List of users', type: [CreateUserDto] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/me')
  findMe(@Authaccount() auth: AuthenticatedUser) {
    return this.usersService.findOne(auth.sub);
  }

  @Get('/:id')
  @ApiOkResponse({ description: 'The user', type: CreateUserDto })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the user',
    required: true,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    void auth;
    return this.usersService.findOne(id);
  }

  @Put('/me')
  updateMe(
    @Authaccount() auth: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(auth.sub, updateUserDto);
  }

  @Delete('/me')
  removeMe(@Authaccount() auth: AuthenticatedUser) {
    return this.usersService.remove(auth.sub);
  }

  @Put('/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
