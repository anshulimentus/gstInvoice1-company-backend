// src/invoice/invoice.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { ConfigModule } from '@nestjs/config';
import { InvoiceItem } from './entities/invoiceItem.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer]),
    ConfigModule.forRoot(), // For accessing environment variables
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}