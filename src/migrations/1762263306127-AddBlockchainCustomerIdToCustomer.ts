import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockchainCustomerIdToCustomer1762263306127 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD "blockchainCustomerId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "blockchainCustomerId"`);
    }

}
