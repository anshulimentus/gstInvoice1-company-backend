import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialMigration1730612752000 implements MigrationInterface {
  name = 'InitialMigration1730612752000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if users table exists
    const usersTableExists = await queryRunner.hasTable('users');
    if (!usersTableExists) {
      // Create users table
      await queryRunner.createTable(
        new Table({
          name: 'users',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'email',
              type: 'varchar',
              isUnique: true,
            },
            {
              name: 'password',
              type: 'varchar',
            },
            {
              name: 'name',
              type: 'varchar',
            },
            {
              name: 'role',
              type: 'varchar',
              default: "'User'",
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    // Check if state table exists
    const stateTableExists = await queryRunner.hasTable('state');
    if (!stateTableExists) {
      // Create state table
      await queryRunner.createTable(
        new Table({
          name: 'state',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'stateName',
              type: 'varchar',
            },
            {
              name: 'stateCode',
              type: 'varchar',
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }

    // Check if company table exists
    const companyTableExists = await queryRunner.hasTable('company');
    if (!companyTableExists) {
      // Create company table
      await queryRunner.createTable(
        new Table({
          name: 'company',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'Company_Name',
              type: 'varchar',
            },
            {
              name: 'GST_Number',
              type: 'varchar',
            },
            {
              name: 'Transaction_Hash',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'Legal_Representative',
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
              name: 'First_name',
              type: 'varchar',
            },
            {
              name: 'Last_name',
              type: 'varchar',
            },
            {
              name: 'Email',
              type: 'varchar',
              isUnique: true,
            },
            {
              name: 'Password',
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

    // Check if customer table exists
    const customerTableExists = await queryRunner.hasTable('customer');
    if (!customerTableExists) {
      // Create customer table
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

    // Check if product table exists
    const productTableExists = await queryRunner.hasTable('product');
    if (!productTableExists) {
      // Create product table
      await queryRunner.createTable(
        new Table({
          name: 'product',
          columns: [
            {
              name: 'productID',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'productName',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'gstRate',
              type: 'numeric',
              precision: 10,
              scale: 2,
            },
            {
              name: 'productDescription',
              type: 'text',
            },
            {
              name: 'transactionHash',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'image_url',
              type: 'text',
            },
            {
              name: 'image_id',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'unitPrice',
              type: 'numeric',
              precision: 10,
              scale: 2,
            },
            {
              name: 'service',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'company_tenant_id',
              type: 'uuid',
            },
          ],
        }),
      );
    }

    // Check if invoice table exists
    const invoiceTableExists = await queryRunner.hasTable('invoice');
    if (!invoiceTableExists) {
      // Create invoice table
      await queryRunner.createTable(
        new Table({
          name: 'invoice',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'uuid_generate_v4()',
            },
            {
              name: 'invoicenumber',
              type: 'varchar',
            },
            {
              name: 'invoicedate',
              type: 'date',
            },
            {
              name: 'supplyType',
              type: 'varchar',
            },
            {
              name: 'sellerId',
              type: 'integer',
            },
            {
              name: 'buyerId',
              type: 'integer',
            },
            {
              name: 'totalamount',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'gstamount',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'grandtotal',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'paymentTerms',
              type: 'varchar',
            },
            {
              name: 'transactionHash',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'isFinal',
              type: 'boolean',
            },
            {
              name: 'items',
              type: 'json',
            },
            {
              name: 'createdat',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'status',
              type: 'varchar',
              default: "'pending'",
            },
            {
              name: 'buyerApprovalDate',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'approvedBy',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'is_claimed_for_itc',
              type: 'boolean',
              default: false,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['sellerId'],
              referencedTableName: 'company',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['buyerId'],
              referencedTableName: 'customer',
              referencedColumnNames: ['id'],
            },
          ],
        }),
      );
    }

    // Check if itc_claim table exists
    const itcClaimTableExists = await queryRunner.hasTable('itc_claim');
    if (!itcClaimTableExists) {
      // Create itc_claim table
      await queryRunner.createTable(
        new Table({
          name: 'itc_claim',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'uuid_generate_v4()',
            },
            {
              name: 'invoiceId',
              type: 'uuid',
            },
            {
              name: 'claimedAmount',
              type: 'decimal',
              precision: 10,
              scale: 2,
            },
            {
              name: 'claimDate',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'status',
              type: 'varchar',
              default: "'pending'",
            },
            {
              name: 'transactionHash',
              type: 'varchar',
              isNullable: true,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['invoiceId'],
              referencedTableName: 'invoice',
              referencedColumnNames: ['id'],
            },
          ],
        }),
      );
    }

    // Check if image table exists
    const imageTableExists = await queryRunner.hasTable('image');
    if (!imageTableExists) {
      // Create image table
      await queryRunner.createTable(
        new Table({
          name: 'image',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'filename',
              type: 'varchar',
            },
            {
              name: 'originalname',
              type: 'varchar',
            },
            {
              name: 'mimetype',
              type: 'varchar',
            },
            {
              name: 'size',
              type: 'bigint',
            },
            {
              name: 'url',
              type: 'varchar',
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('itc_claim');
    await queryRunner.dropTable('invoice');
    await queryRunner.dropTable('product');
    await queryRunner.dropTable('customer');
    await queryRunner.dropTable('company');
    await queryRunner.dropTable('image');
    await queryRunner.dropTable('state');
    await queryRunner.dropTable('users');
  }
}
