import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSchema1762419007849 implements MigrationInterface {
    name = 'FixSchema1762419007849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_invoice_buyer"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_invoice_seller"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "wallet_address" TO "name"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_196ef3e52525d3cd9e203bdb1de" TO "UQ_51b8b26ac168fbe7d6f5653e6cf"`);
        await queryRunner.query(`CREATE TABLE "itc_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "company_id" character varying NOT NULL, "company_wallet" character varying NOT NULL, "input_gst" numeric(12,2) NOT NULL, "output_gst" numeric(12,2) NOT NULL, "claimable_amount" numeric(12,2) NOT NULL, "transaction_hash" character varying NOT NULL, "claimed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b17685643007a1d9abfb6ddb4f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "customerType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "UQ_97ceb83b9d740361c06d748f804"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "is_claimed_for_itc" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "blockchainProductId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'User'`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_4a963192946d98575d654609114" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_8900c9dd86b637d32174a965fa1" FOREIGN KEY ("sellerId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_ec771041a9248416f3062013973" FOREIGN KEY ("buyerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_ec771041a9248416f3062013973"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_8900c9dd86b637d32174a965fa1"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP CONSTRAINT "FK_4a963192946d98575d654609114"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "blockchainProductId" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "is_claimed_for_itc" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "UQ_97ceb83b9d740361c06d748f804" UNIQUE ("wallet_address")`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "customerType" SET DEFAULT 'individual'`);
        await queryRunner.query(`DROP TABLE "itc_claims"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" TO "UQ_196ef3e52525d3cd9e203bdb1de"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "wallet_address"`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_seller" FOREIGN KEY ("sellerId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_buyer" FOREIGN KEY ("buyerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
