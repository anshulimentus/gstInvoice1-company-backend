import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCompanyEntity1762764081069 implements MigrationInterface {
    name = 'UpdateCompanyEntity1762764081069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "UQ_b6240ce86c49bd4bdfce88d80ae"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "legal_representative"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "image_id"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_d6103fd43b205e2934bc5b92903"`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30" FOREIGN KEY ("company_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_d6103fd43b205e2934bc5b92903" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_d6103fd43b205e2934bc5b92903"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495"`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_d6103fd43b205e2934bc5b92903" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30" FOREIGN KEY ("company_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "company" ADD "image_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "legal_representative" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "UQ_b6240ce86c49bd4bdfce88d80ae" UNIQUE ("legal_representative")`);
    }

}
