import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeItcClaimCompanyIdToVarchar1763471891187 implements MigrationInterface {
    name = 'ChangeItcClaimCompanyIdToVarchar1763471891187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "companyTenantId"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "companyTenantId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD "companyId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."itc_claim_status_enum" RENAME TO "itc_claim_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."itc_claims_status_enum" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'processed')`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" TYPE "public"."itc_claims_status_enum" USING "status"::"text"::"public"."itc_claims_status_enum"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."itc_claim_status_enum_old"`);
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
        await queryRunner.query(`CREATE TYPE "public"."itc_claim_status_enum_old" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'processed')`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" TYPE "public"."itc_claim_status_enum_old" USING "status"::"text"::"public"."itc_claim_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."itc_claims_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."itc_claim_status_enum_old" RENAME TO "itc_claim_status_enum"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD "companyId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "companyTenantId"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "companyTenantId" uuid NOT NULL`);
    }

}
