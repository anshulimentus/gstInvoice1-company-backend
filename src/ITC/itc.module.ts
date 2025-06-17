import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ITCController } from './itc.controller';
import { ITCService } from './itc.service';
import { Invoice } from 'src/invoice/entities/invoice.entity'; // Import the Invoice entity

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice])  // 👈 THIS is required
      ],
  controllers: [ITCController],
  providers: [ITCService],
  exports: [ITCService],
})
export class ITCModule {}