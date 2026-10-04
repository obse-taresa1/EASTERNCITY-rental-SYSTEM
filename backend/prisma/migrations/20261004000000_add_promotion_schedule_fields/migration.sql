-- Adds the fields already defined by the active Promotion model.
-- This is additive only: no existing Promotion records are changed or removed.
ALTER TABLE "Promotion"
  ADD COLUMN IF NOT EXISTS "durationDays" INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "discount" INTEGER,
  ADD COLUMN IF NOT EXISTS "customTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "customSubtitle" TEXT,
  ADD COLUMN IF NOT EXISTS "specs" TEXT;
