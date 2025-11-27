import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {config} from 'dotenv';
import { Company } from '../src/entities/company.entity';
import { Customer } from '../src/entities/customer.entity';
import { ImageEntity } from '../src/entities/image.entity';
import { Invoice } from '../src/entities/invoice.entity';
import { ItcClaim } from '../src/entities/itc-claim.entity';
// import { Itc } from '../src/itc/entities/itc.entity';
import { Product } from '../src/entities/product.entity';
import { State } from '../src/entities/state.entity';
import { User } from '../src/entities/users.entity';

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
