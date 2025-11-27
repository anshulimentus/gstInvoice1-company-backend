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

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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
  migrations: [
    __dirname + '/1764236784154-InitialSchema.ts',
  ],
  synchronize: false,
  logging: true,
});