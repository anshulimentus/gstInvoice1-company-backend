import {
  Controller,
  BadRequestException,
  Get,
  Body,
  Post,
  Patch,
  Delete,
  UseGuards,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import * as chalk from 'chalk';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/roles.enum';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    // console.log(chalk.bgGreenBright("🚀 Create Customer router hit...."));
    return this.customerService.create(createCustomerDto);
  }

  @Get('demo')
  async demo() {
    // console.log(chalk.bgGreenBright("🚀 Customer controller hit: demo"));
    return { status: 'active' };
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async findAllByTenant(@Param('tenantId') tenantId: string) {
    // console.log(chalk.bgCyanBright("🚀 Get Product by tenantId router hit...."));
    return this.customerService.findAllByTenantId(tenantId);
  }

  @Get('total')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async totalCustomers() {
    // console.log(chalk.bgGreenBright("🚀 Total Customer router hit...."));
    const count = await this.customerService.totalCustomers();
    return { totalCustomers: count };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async findAll() {
    // console.log(chalk.bgGreenBright("🚀 Get all customer router hit...."));
    return this.customerService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async findOne(@Param('id') id: string) {
    // console.log(chalk.bgGreenBright("🚀 Fetching customer with ID:", id));
    return this.customerService.findOne(id); // Pass `id` as string
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    // console.log(chalk.bgGreenBright("🚀 Update customer router hit...."));
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  async remove(@Param('id') id: string) {
    // console.log(chalk.bgGreenBright("🚀 Delete customer router hit...."));
    return this.customerService.remove(id);
  }
}
