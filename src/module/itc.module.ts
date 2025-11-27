import { Module } from '@nestjs/common';
import { ItcController } from '../controller/itc.controller';
import { ItcService } from '../service/itc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItcClaim } from '../entities/itc-claim.entity';
import { Invoice } from '../entities/invoice.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItcClaim, Invoice, Company]), // Importing the ItcClaim, Invoice, and Company entities
  ],
  controllers: [ItcController],
  providers: [ItcService],
  exports: [ItcService],
})
export class ItcModule {}
