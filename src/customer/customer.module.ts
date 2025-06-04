import { Module } from "@nestjs/common";
import { Customer } from "./entities/customer.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";

@Module({
    imports: [TypeOrmModule.forFeature([Customer])],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService]
})

export class CustomerModule {}  