import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  // Get all companies
  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    // Check for duplicates
    const existing = await this.companyRepository.findOne({
      where: [{ gstNumber: dto.gstNumber }, { email: dto.email }],
    });

    if (existing)
      throw new BadRequestException(
        'Company already exists with this GST or Email.',
      );

    const company = this.companyRepository.create({
      ...dto,
      tenantId: dto.tenantId ?? uuidv4(),
    });

    try {
      return await this.companyRepository.save(company);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create company: ' + error.message,
      );
    }
  }


  // Get all companies using tenant id
  async findByTenantId(tenantId: string) {
    const company = await this.companyRepository.findOne({
      where: { tenantId },
      relations: ['invoices'], // optional: include relations if needed
    });

    if (!company) {
      throw new NotFoundException(
        `Company with tenant ID ${tenantId} not found`,
      );
    }

    return company;
  }

  // Get a company by ID
  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }
}
