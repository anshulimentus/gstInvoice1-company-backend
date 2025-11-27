import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764236784154 implements MigrationInterface {
    name = 'InitialSchema1764236784154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop all existing tables and constraints
        await queryRunner.query(`DROP TABLE IF EXISTS "itc_claims" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "invoice" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "product" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "customer" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "images" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "State" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "company" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "migrations" CASCADE`);

        // Drop all existing types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."customer_customertype_enum" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."invoice_status_enum" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."product_type_enum" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."itc_claims_status_enum" CASCADE`);

        // Create migrations table
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))`);

        // Create all tables fresh
        await queryRunner.query(`CREATE TYPE "public"."customer_customertype_enum" AS ENUM('individual', 'business')`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(15), "gstNumber" character varying(15) NOT NULL, "panNumber" character varying(10), "customerType" "public"."customer_customertype_enum" NOT NULL DEFAULT 'individual', "billingAddress" text NOT NULL, "stateCode" integer NOT NULL, "totalInvoices" integer NOT NULL DEFAULT '0', "totalAmountBilled" numeric(15,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "transactionHash" character varying, "walletAddress" character varying(255) NOT NULL, "blockchainCustomerId" integer, "companyTenantId" character varying(255) NOT NULL, "company_tenant_id" uuid, CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "UQ_03846b4bae9df80f19c76005a82" UNIQUE ("phone"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "itc_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "companyId" character varying(255) NOT NULL, "companyWallet" character varying(255) NOT NULL, "input_gst" numeric(12,2) NOT NULL, "output_gst" numeric(12,2) NOT NULL, "claimable_amount" numeric(12,2) NOT NULL, "transactionHash" character varying(255) NOT NULL, "claimedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "company_id" uuid, CONSTRAINT "REL_4a963192946d98575d65460911" UNIQUE ("invoice_id"), CONSTRAINT "PK_b17685643007a1d9abfb6ddb4f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('pending', 'approved', 'rejected', 'finalized', 'itc_claimed')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("invoiceId" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceNo" character varying(255) NOT NULL, "invoiceDate" date NOT NULL, "supplyType" character varying(255) NOT NULL, "totalTaxableValue" numeric(10,2) NOT NULL, "totalGstAmount" numeric(10,2) NOT NULL, "grandTotal" numeric(10,2) NOT NULL, "paymentTerms" character varying(255) NOT NULL, "transactionHash" character varying, "isFinal" boolean NOT NULL DEFAULT false, "items" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'pending', "buyerApprovalDate" TIMESTAMP, "approvedBy" character varying, "isClaimedForITC" boolean NOT NULL DEFAULT false, "placeOfSupply" character varying, "dueDate" date, "seller_id" integer, "buyer_id" uuid, CONSTRAINT "PK_c7e255ecd0c1a5ba5cb11e959ae" PRIMARY KEY ("invoiceId"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_type_enum" AS ENUM('product', 'service')`);
        await queryRunner.query(`CREATE TABLE "product" ("productID" SERIAL NOT NULL, "productName" character varying(255) NOT NULL, "gstRate" numeric(10,2) NOT NULL, "productDescription" text NOT NULL, "transactionHash" character varying(255), "imageUrl" text, "basePrice" numeric(10,2) NOT NULL, "finalPrice" numeric(10,2) NOT NULL, "type" "public"."product_type_enum" NOT NULL DEFAULT 'product', "blockchainProductId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "company_tenant_id" uuid NOT NULL, CONSTRAINT "PK_580f3440cb4d71537c729bc34f1" PRIMARY KEY ("productID"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "company_name" character varying(255) NOT NULL, "gst_number" character varying(15) NOT NULL, "transaction_hash" character varying, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "address" character varying, "state_id" bigint, "tenant_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_address" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_eb47ab42b0c2f9a23d10feb3e69" UNIQUE ("gst_number"), CONSTRAINT "UQ_b0fc567cf51b1cf717a9e8046a1" UNIQUE ("email"), CONSTRAINT "UQ_d37ba2ef0271f80021e0b6ef926" UNIQUE ("tenant_id"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "base64data" text NOT NULL, "mimetype" character varying NOT NULL, "uploadedat" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "State" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_2f896ea8815d952f289ac9a562c" UNIQUE ("name"), CONSTRAINT "PK_ba7801fef9aabc0a35a0110c896" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'User', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "walletAddress" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."itc_claims_status_enum" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'processed')`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD "status" "public"."itc_claims_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_4a963192946d98575d654609114" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("invoiceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30" FOREIGN KEY ("company_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_e04555367efe6ce8b43342831fe" FOREIGN KEY ("seller_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_9d4a49292d896d975ce0a6c9969" FOREIGN KEY ("buyer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_d6103fd43b205e2934bc5b92903" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_d6103fd43b205e2934bc5b92903"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495"`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "tenant_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD CONSTRAINT "FK_3c1ed225307bfbf9b00f1b3ae30" FOREIGN KEY ("company_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_0610a5af08fbbfb995a7eea7495" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_d6103fd43b205e2934bc5b92903" FOREIGN KEY ("company_tenant_id") REFERENCES "company"("tenant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itc_claims" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "itc_claims" ADD "companyId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "companyTenantId"`);
        await queryRunner.query(`ALTER TABLE "customer" ADD "companyTenantId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "walletAddress"`);
    }

}
