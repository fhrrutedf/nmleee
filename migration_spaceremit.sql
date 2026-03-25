-- ============================================================
-- Migration: Spaceremit Gateway + AGENCY Tier
-- Date: 2026-03-25
-- Description:
--   1. Add AGENCY to PlanType enum
--   2. Add agencyCommissionRate, agencyEscrowDays to platform_settings
--   3. Add vodafoneCashNumber, spaceremitEnabled, shamcashEnabled,
--      stripeEnabled to platform_settings
-- ============================================================

-- 1. Add AGENCY to PlanType enum (PostgreSQL)
-- Note: Prisma enums in PostgreSQL require ALTER TYPE
DO $$
BEGIN
    -- Check if 'AGENCY' already exists to make this migration idempotent
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'AGENCY'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'PlanType'
          )
    ) THEN
        ALTER TYPE "PlanType" ADD VALUE 'AGENCY';
    END IF;
END
$$;

-- 2. Add new columns to platform_settings (all nullable/with defaults for safety)

ALTER TABLE "platform_settings"
    ADD COLUMN IF NOT EXISTS "agencyCommissionRate"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "agencyEscrowDays"      INTEGER          NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "vodafoneCashNumber"    TEXT,
    ADD COLUMN IF NOT EXISTS "spaceremitEnabled"     BOOLEAN          NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "shamcashEnabled"       BOOLEAN          NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "stripeEnabled"         BOOLEAN          NOT NULL DEFAULT FALSE;

-- 3. Update existing singleton record if it exists
UPDATE "platform_settings"
SET
    "agencyCommissionRate" = 0,
    "agencyEscrowDays"     = 1,
    "spaceremitEnabled"    = TRUE,
    "shamcashEnabled"      = TRUE,
    "stripeEnabled"        = FALSE
WHERE id = 'singleton';
