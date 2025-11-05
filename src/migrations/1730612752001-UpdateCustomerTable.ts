import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class UpdateCustomerTable1730612752001 implements MigrationInterface {
  name = 'UpdateCustomerTable1730612752001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing customer table
    await queryRunner.dropTable('customer');

    // Create new customer table that matches the entity
    await queryRunner.createTable(
      new Table({
        name: 'customer',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '15',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'gstNumber',
            type: 'varchar',
            length: '15',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'panNumber',
            type: 'varchar',
            length: '10',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'customerType',
            type: 'enum',
            enum: ['individual', 'business'],
            isNullable: false,
            default: "'individual'",
          },
          {
            name: 'billingAddress',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'stateCode',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'totalInvoices',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'totalAmountBilled',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'transactionHash',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'wallet_address',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'company_tenant_id',
            type: 'uuid',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new customer table
    await queryRunner.dropTable('customer');

    // Recreate the old customer table structure
    await queryRunner.createTable(
      new Table({
        name: 'customer',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'customerName',
            type: 'varchar',
          },
          {
            name: 'gstNumber',
            type: 'varchar',
          },
          {
            name: 'transactionHash',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'legalRepresentative',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'image_url',
            type: 'text',
          },
          {
            name: 'image_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'categoryID',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stateID',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isUnique: true,
            default: 'uuid_generate_v4()',
          },
        ],
      }),
    );
  }
}
