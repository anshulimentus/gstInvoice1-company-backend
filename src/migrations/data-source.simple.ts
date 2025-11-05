import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSourceSimple = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false,
  synchronize: false,
  logging: false,
  migrationsTableName: 'migrations',
  migrations: ['src/migrations/*.ts'],
});
