-- Database Migration Script to Fix Issues
-- Run this directly in your PostgreSQL database

-- 1. Create the missing itc_claims table
CREATE TABLE IF NOT EXISTS "itc_claims" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "invoice_id" uuid NOT NULL,
    "company_id" varchar NOT NULL,
    "company_wallet" varchar NOT NULL,
    "input_gst" decimal(12,2) NOT NULL,
    "output_gst" decimal(12,2) NOT NULL,
    "claimable_amount" decimal(12,2) NOT NULL,
    "transaction_hash" varchar,
    "claimed_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "FK_itc_claims_invoice" 
        FOREIGN KEY ("invoice_id") 
        REFERENCES "invoice"("id")
);

-- 2. Fix customer unique constraints
-- First, drop the problematic global unique constraints
DROP INDEX IF EXISTS "UQ_97ceb83b9d740361c06d748f804";
DROP INDEX IF EXISTS "UQ_customer_email_global";
DROP INDEX IF EXISTS "UQ_customer_phone";
DROP INDEX IF EXISTS "UQ_customer_gstNumber";
DROP INDEX IF EXISTS "UQ_customer_panNumber";

-- 3. Add composite unique constraints per company
-- This allows same customer across different companies but prevents duplicates within same company
CREATE UNIQUE INDEX "UQ_customer_gst_per_company" 
ON "customer" ("gstNumber", "company_tenant_id");

CREATE UNIQUE INDEX "UQ_customer_wallet_per_company" 
ON "customer" ("wallet_address", "company_tenant_id");

-- Keep email globally unique (good business practice)
CREATE UNIQUE INDEX "UQ_customer_email_global" 
ON "customer" ("email");

-- 4. Clean up any orphaned ITC claim entries if needed
-- (Run only if you have data integrity issues)
-- DELETE FROM "itc_claims" WHERE "invoice_id" NOT IN (SELECT "id" FROM "invoice");

-- 5. Verify the changes by checking the structure
-- Run this to see your customer table constraints:
-- SELECT 
--     conname as constraint_name,
--     conrelid::regclass as table_name,
--     pg_get_constraintdef(c.oid) as constraint_definition
-- FROM pg_constraint c
-- WHERE conrelid = 'customer'::regclass
-- AND contype = 'u';

-- 6. Verify itc_claims table exists:
-- \d itc_claims

-- Summary:
-- - itc_claims table is now created for ITC functionality
-- - Customer constraints now allow same customer across different companies
-- - Within each company, customers remain unique by GST and wallet address
-- - This resolves the "duplicate key value violates unique constraint" errors