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
    __dirname + '/1730612752000-InitialMigration.ts',
    __dirname + '/1730612752001-UpdateCustomerTable.ts',
    __dirname + '/1762254339210-AddBlockchainProductId.ts',
    __dirname + '/1762263306127-AddBlockchainCustomerIdToCustomer.ts',
    __dirname + '/1762263306128-AddMissingInvoiceColumns.ts',
  ],
  synchronize: false,
  logging: true,
});
