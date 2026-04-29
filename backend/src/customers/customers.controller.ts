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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Authaccount } from '../auth/decorators/authaccount.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(AuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.customersService.create(createCustomerDto, auth);
  }

  @Get()
  findAll(@Authaccount() auth: AuthenticatedUser) {
    return this.customersService.findAll(auth);
  }

  @Get('me')
  findMe(@Authaccount() auth: AuthenticatedUser) {
    return this.customersService.findAuthenticatedCustomer(auth);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.customersService.findOne(id, auth);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.customersService.update(id, updateCustomerDto, auth);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Authaccount() auth: AuthenticatedUser,
  ) {
    return this.customersService.remove(id, auth);
  }
}
