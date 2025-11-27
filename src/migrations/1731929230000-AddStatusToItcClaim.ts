import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToItcClaim1731929230000 implements MigrationInterface {
    name = 'AddStatusToItcClaim1731929230000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "itc_claim_status_enum" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'processed')`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD "status" "itc_claim_status_enum" NOT NULL DEFAULT 'draft'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "itc_claim_status_enum"`);
    }

}