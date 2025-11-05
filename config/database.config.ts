import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {config} from 'dotenv';
import { Company } from '../src/company/entities/company.entity';
import { Customer } from '../src/customer/entities/customer.entity';
import { ImageEntity } from '../src/image/image.entity';
import { Invoice } from '../src/invoice/entities/invoice.entity';
import { ItcClaim } from '../src/itc/entities/itc-claim.entity';
// import { Itc } from '../src/itc/entities/itc.entity';
import { Product } from '../src/product/entities/product.entity';
import { State } from '../src/State/entities/state.entity';
import { User } from '../src/users/users.entity';

config();

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [Product, Customer, User, ImageEntity, State, Company, Invoice, ItcClaim],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production', // Disable logging in production
    migrations: ["../src/migrations/*.ts"],
    autoLoadEntities: true,
    extra: process.env.NODE_ENV === 'production' ? {
        max: 20, // Maximum number of connections
        connectionTimeoutMillis: 2000,
        query_timeout: 10000,
        statement_timeout: 10000,
    } : undefined,
};
