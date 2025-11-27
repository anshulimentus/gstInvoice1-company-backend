import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './module/product.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/database.config';
import { CustomerModule } from './module/customer.module';
import { AuthModule } from './module/auth.module';
import { UsersModule } from './module/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImageModule } from './module/image.module';
import { StateModule } from './module/state.module';
import { CompanyModule } from './module/company.module';
import { InvoiceModule } from './module/invoice.module';
import { ItcModule } from './module/itc.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductModule,
    CustomerModule,
    AuthModule,
    UsersModule,
    ImageModule,
    StateModule,
    CompanyModule,
    InvoiceModule,
    ItcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
