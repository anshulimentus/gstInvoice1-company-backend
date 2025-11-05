import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Company } from '../company/entities/company.entity';
import { Customer } from '../customer/entities/customer.entity';
import { ImageEntity } from '../image/image.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { ItcClaim } from '../itc/entities/itc-claim.entity';
import { Product } from '../product/entities/product.entity';
import { State } from '../State/entities/state.entity';
import { User } from '../users/users.entity';

config();

export const AppDataSourceLocal = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local development
  entities: [Product, Customer, User, ImageEntity, State, Company, Invoice, ItcClaim],
  migrations: [__dirname + '/*.ts'],
  synchronize: false,
  logging: true,
  migrationsTableName: 'migrations',
});
