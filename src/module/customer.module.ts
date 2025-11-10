import { Module } from '@nestjs/common';
import { Customer } from '../entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from '../controller/customer.controller';
import { CustomerService } from '../service/customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
