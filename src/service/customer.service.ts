import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findOne({
      where: [{ phone: createCustomerDto.phone }, { email: createCustomerDto.email }],
    });

    if (existingCustomer) {
      throw new BadRequestException('Customer with given phone or email already exists.');
    }

    const newCustomer = this.customerRepository.create(createCustomerDto);

    if (
      !newCustomer.walletAddress ||
      !newCustomer.name ||
      !newCustomer.gstNumber
    ) {
      throw new BadRequestException('Missing required fields for blockchain transaction');
    }

    return await this.customerRepository.save(newCustomer);
  }

  // Get all customers
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  // Get one customer by ID
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  // Get customers by tenant ID
  async findAllByTenantId(companyTenantId: string): Promise<Customer[]> {
    return this.customerRepository.find({ where: { companyTenantId } });
  }

  // Get total customer count
  async totalCustomers(): Promise<number> {
    return this.customerRepository.count();
  }
}
