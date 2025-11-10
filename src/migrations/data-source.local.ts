import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Company } from '../entities/company.entity';
import { Customer } from '../entities/customer.entity';
import { ImageEntity } from '../entities/image.entity';
import { Invoice } from '../entities/invoice.entity';
import { ItcClaim } from '../entities/itc-claim.entity';
import { Product } from '../entities/product.entity';
import { State } from '../entities/state.entity';
import { User } from '../entities/users.entity';

config();

export const AppDataSourceLocal = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local development
  entities: [
    Product,
    Customer,
    User,
    ImageEntity,
    State,
    Company,
    Invoice,
    ItcClaim,
  ],
  migrations: ['src/migrations/1762759238515-InitialEntities.ts', 'src/migrations/1762764081069-UpdateCompanyEntity.ts'],
  synchronize: false,
  logging: true,
  migrationsTableName: 'migrations',
});
