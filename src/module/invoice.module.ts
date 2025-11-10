import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceController } from '../controller/invoice.controller';
import { Invoice } from '../entities/invoice.entity';
import { ConfigModule } from '@nestjs/config';
import { Customer } from '../entities/customer.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Customer, Company]),
    ConfigModule.forRoot(), // For accessing environment variables
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
