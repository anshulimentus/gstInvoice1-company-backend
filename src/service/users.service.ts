import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  // Find a company by email
  async findOneByEmail(email: string): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { email } });
  }

  // Find a company by ID
  async findById(id: number): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { id } });
  }

  // Optional: Create a company with partial data
  async createCompany(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(data);
    return await this.companyRepository.save(company);
  }
}
