import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Company } from 'src/company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])], // Import TypeOrmModule with User entity
  providers: [UsersService],
  controllers: [UsersController], 
  exports: [UsersService],
})
export class UsersModule {}
