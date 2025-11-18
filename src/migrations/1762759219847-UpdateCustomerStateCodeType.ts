import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCustomerStateCodeType1731512400000 implements MigrationInterface {
    name = 'UpdateCustomerStateCodeType1731512400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "stateCode" TYPE int`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "stateCode" TYPE bigint`);
    }

}