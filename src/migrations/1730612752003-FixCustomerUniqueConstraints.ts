import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCustomerUniqueConstraints1730612752003 implements MigrationInterface {
  name = 'FixCustomerUniqueConstraints1730612752003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if customer table exists
    const customerTableExists = await queryRunner.hasTable('customer');
    if (customerTableExists) {
      
      // Drop existing unique constraints that are too restrictive
      try {
        // Drop the global unique constraint on wallet_address
        await queryRunner.query(`
          DROP INDEX IF EXISTS "UQ_97ceb83b9d740361c06d748f804"
        `);
        console.log('Dropped old wallet_address unique constraint');
      } catch (error) {
        console.log('Old wallet_address constraint not found or already dropped:', error.message);
      }

      try {
        // Drop unique constraint on email if it exists and is problematic
        await queryRunner.query(`
          ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "UQ_customer_email"
        `);
      } catch (error) {
        console.log('Email constraint not found:', error.message);
      }

      try {
        // Drop unique constraint on phone if it exists and is problematic
        await queryRunner.query(`
          ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "UQ_customer_phone"
        `);
      } catch (error) {
        console.log('Phone constraint not found:', error.message);
      }

      try {
        // Drop unique constraint on gstNumber if it exists and is problematic
        await queryRunner.query(`
          ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "UQ_customer_gstNumber"
        `);
      } catch (error) {
        console.log('GST Number constraint not found:', error.message);
      }

      try {
        // Drop unique constraint on panNumber if it exists and is problematic
        await queryRunner.query(`
          ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "UQ_customer_panNumber"
        `);
      } catch (error) {
        console.log('PAN Number constraint not found:', error.message);
      }

      // Add composite unique constraints - allow same customer across different companies
      try {
        await queryRunner.query(`
          CREATE UNIQUE INDEX "UQ_customer_gst_per_company" 
          ON "customer" ("gstNumber", "company_tenant_id")
        `);
        console.log('Added composite unique constraint for gstNumber per company');
      } catch (error) {
        console.log('Could not create GST per company constraint:', error.message);
      }

      try {
        await queryRunner.query(`
          CREATE UNIQUE INDEX "UQ_customer_wallet_per_company" 
          ON "customer" ("wallet_address", "company_tenant_id")
        `);
        console.log('Added composite unique constraint for wallet_address per company');
      } catch (error) {
        console.log('Could not create wallet_address per company constraint:', error.message);
      }

      // Keep email unique globally (business requirement)
      try {
        await queryRunner.query(`
          CREATE UNIQUE INDEX "UQ_customer_email_global" 
          ON "customer" ("email")
        `);
        console.log('Added global unique constraint for email');
      } catch (error) {
        console.log('Could not create email global constraint:', error.message);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes
    const customerTableExists = await queryRunner.hasTable('customer');
    if (customerTableExists) {
      // Drop composite constraints
      try {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "UQ_customer_gst_per_company"
        `);
      } catch (error) {
        console.log('Could not drop GST per company constraint:', error.message);
      }

      try {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "UQ_customer_wallet_per_company"
        `);
      } catch (error) {
        console.log('Could not drop wallet_address per company constraint:', error.message);
      }

      try {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "UQ_customer_email_global"
        `);
      } catch (error) {
        console.log('Could not drop email global constraint:', error.message);
      }

      // Note: We can't easily recreate the old global unique constraints
      // because we don't know their exact names or if they were created
      // This migration is primarily for fixing the current constraint issues
    }
  }
}