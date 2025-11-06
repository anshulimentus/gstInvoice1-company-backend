import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateItcClaimsTable1730612752002 implements MigrationInterface {
  name = 'CreateItcClaimsTable1730612752002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if itc_claims table exists (it should be created by InitialMigration but let's be safe)
    const itcClaimsTableExists = await queryRunner.hasTable('itc_claims');
    if (!itcClaimsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'itc_claims',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'uuid_generate_v4()',
            },
            {
              name: 'invoice_id',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'company_id',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'company_wallet',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'input_gst',
              type: 'decimal',
              precision: 12,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'output_gst',
              type: 'decimal',
              precision: 12,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'claimable_amount',
              type: 'decimal',
              precision: 12,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'transaction_hash',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'claimed_at',
              type: 'timestamp with time zone',
              default: 'now()',
              isNullable: false,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['invoice_id'],
              referencedTableName: 'invoice',
              referencedColumnNames: ['id'],
            },
          ],
        }),
      );
    }

    // Add unique constraint for wallet_address in customer table if not exists
    const customerTableExists = await queryRunner.hasTable('customer');
    if (customerTableExists) {
      // Check if the constraint already exists
      const constraintsResult = await queryRunner.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conname = 'UQ_97ceb83b9d740361c06d748f804' 
        AND conrelid = 'customer'::regclass
      `);
      
      if (constraintsResult.length === 0) {
        try {
          await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_97ceb83b9d740361c06d748f804" 
            ON "customer" ("wallet_address")
          `);
        } catch (error) {
          console.log('Unique constraint already exists or cannot be created:', error.message);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const itcClaimsTableExists = await queryRunner.hasTable('itc_claims');
    if (itcClaimsTableExists) {
      await queryRunner.dropTable('itc_claims');
    }
  }
}