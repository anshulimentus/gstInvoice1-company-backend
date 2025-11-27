import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from '../service/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/roles.enum';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create new customer
  @Post('add')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  // Health check
  @Get('demo')
  async demo() {
    return { status: 'active' };
  }

  // Get all customers belonging to a specific tenant
  @Get('tenant/:tenantId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  async findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.customerService.findAllByTenantId(tenantId);
  }

  // Get total customer count
  @Get('total')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  async totalCustomers() {
    const count = await this.customerService.totalCustomers();
    return { totalCustomers: count };
  }

  // Get all customers
  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  async findAll() {
    return this.customerService.findAll();
  }

  // Get single customer by ID
  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }
}
