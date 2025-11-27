import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeMonetaryColumnsToInt1764236784155 implements MigrationInterface {
    name = 'ChangeMonetaryColumnsToInt1764236784155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change product prices to int
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "basePrice" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "finalPrice" TYPE integer`);

        // Change customer totalAmountBilled to int
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "totalAmountBilled" TYPE integer`);

        // Change invoice amounts to int
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "totalTaxableValue" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "totalGstAmount" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "grandTotal" TYPE integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert product prices to numeric
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "basePrice" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "finalPrice" TYPE numeric(10,2)`);

        // Revert customer totalAmountBilled to numeric
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "totalAmountBilled" TYPE numeric(15,2)`);

        // Revert invoice amounts to numeric
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "totalTaxableValue" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "totalGstAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "grandTotal" TYPE numeric(10,2)`);
    }
}