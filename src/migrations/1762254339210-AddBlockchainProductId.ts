import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockchainProductId1762254339210 implements MigrationInterface {
    name = 'AddBlockchainProductId1762254339210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only add the blockchainProductId column to the product table
        await queryRunner.query(`ALTER TABLE "product" ADD "blockchainProductId" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the blockchainProductId column from the product table
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "blockchainProductId"`);
    }

}
