import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/company/entities/company.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  // Create a company user with hashed password
  async create(createCompanyDto: Partial<Company>): Promise<Company> {
    const { password, ...companyData } = createCompanyDto;

    if (!password) {
      throw new Error('Password is required');
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = this.companyRepository.create({
      ...companyData,
      password: password, // Ensure the password property exists in the Company entity
    });

    const savedCompany = await this.companyRepository.save(newCompany);
    return Array.isArray(savedCompany) ? savedCompany[0] : savedCompany;
  }

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
