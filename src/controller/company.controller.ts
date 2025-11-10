import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from '../service/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';


@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  @Get('tenant/:tenantId')
  async findByTenantId(@Param('tenantId') tenantId: string) {
    return this.companyService.findByTenantId(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const company = await this.companyService.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }
}
