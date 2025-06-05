import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, ParseIntPipe, NotFoundException, Req
  } from '@nestjs/common';
  import { CompanyService } from './company.service';
  import { CreateCompanyDto } from './dto/create-company.dto';
  import { UpdateCompanyDto } from './dto/update-company.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { Roles } from '../auth/roles.decorator';
  import { RolesGuard } from '../auth/roles.guard';
  import { Role } from '../common/enums/role.enum';
  import * as chalk from 'chalk';

  
  @Controller('company')
  export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}
  
    @Post('add')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin)
    async create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: Request) {
      // console.log(chalk.green("🚀 Create Company router hit...."));
      return this.companyService.create(createCompanyDto, createCompanyDto.image_url);
    }
  
    @Get('demo')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin) */
    async demo() {
      // console.log(chalk.bgBlue("🚀 Demo router hit...."));
      return { message: "Demo route is working" };
    }
  
    @Get('count')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin) */
    async getTotalCompanies() {
      // console.log(chalk.bgBlueBright("🚀 Total company router hit...."));
      const count = await this.companyService.getTotalCompanies();
      return { totalCompanies: count };
    }
  
    @Get()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin) */
    async findAll() {
      // console.log(chalk.bgGreenBright("🚀 Get all company router hit...."));
      return this.companyService.findAll();
    }


    @Get('tenant/:tenantId')
    async findByTenantId(@Param('tenantId') tenantId: string) {
      // console.log(chalk.yellow(`🚀 Fetching company with tenantId: ${tenantId}`));
      return this.companyService.findByTenantId(tenantId);
    }

  
    @Get(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin, Role.User) */
    async findOne(@Param('id', ParseIntPipe) id: number) {
      // console.log(chalk.bgBlueBright("🚀 Fetching company with ID:", id));
      const company = await this.companyService.findOne(id);
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    }
  
    @Patch(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin) */
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCompanyDto: UpdateCompanyDto) {
      // console.log(chalk.bgBlueBright("🚀 Update company router hit...."));
      return this.companyService.update(id, updateCompanyDto);
    }
  
    @Delete(':id')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Admin) */
    async remove(@Param('id', ParseIntPipe) id: number) {
      // console.log(chalk.bgRedBright("🚀 Delete company router hit...."));
      return this.companyService.remove(id);
    }
  }
  