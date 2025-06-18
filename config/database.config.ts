import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {config} from 'dotenv';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { ImageEntity } from 'src/image/image.entity';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import { ItcClaim } from 'src/itc/entities/itc-claim.entity';
// import { Itc } from 'src/itc/entities/itc.entity';
import { Product } from 'src/product/entities/product.entity';
import { State } from 'src/State/entities/state.entity';
import { User } from 'src/users/users.entity';

config();

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [Product, Customer, User, ImageEntity, State, Company, Invoice, ItcClaim],
    synchronize: false,
    logging: true,
    migrations: ["dist/migrations/*.js"],
    autoLoadEntities: true,
};