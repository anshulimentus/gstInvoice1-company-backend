import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingInvoiceColumns1762263306128 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add sellerId column (foreign key to company.id which is integer)
        await queryRunner.query(`ALTER TABLE "invoice" ADD "sellerId" integer`);

        // Add buyerId column (foreign key to customer.id which is uuid)
        await queryRunner.query(`ALTER TABLE "invoice" ADD "buyerId" uuid`);

        // Add status column
        await queryRunner.query(`ALTER TABLE "invoice" ADD "status" varchar DEFAULT 'pending'`);

        // Add buyerApprovalDate column
        await queryRunner.query(`ALTER TABLE "invoice" ADD "buyerApprovalDate" TIMESTAMP`);

        // Add approvedBy column
        await queryRunner.query(`ALTER TABLE "invoice" ADD "approvedBy" varchar`);

        // Add is_claimed_for_itc column
        await queryRunner.query(`ALTER TABLE "invoice" ADD "is_claimed_for_itc" boolean DEFAULT false`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_seller" FOREIGN KEY ("sellerId") REFERENCES "company"("id")`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_buyer" FOREIGN KEY ("buyerId") REFERENCES "customer"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_invoice_buyer"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_invoice_seller"`);

        // Remove columns
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "is_claimed_for_itc"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "approvedBy"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "buyerApprovalDate"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "buyerId"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "sellerId"`);
    }

}
