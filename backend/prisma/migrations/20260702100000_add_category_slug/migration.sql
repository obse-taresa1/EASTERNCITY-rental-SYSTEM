-- AlterTable
ALTER TABLE "Category" ADD COLUMN "slug" TEXT;

-- Backfill existing rows before making the column required.
UPDATE "Category"
SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Make slug required after backfill.
ALTER TABLE "Category" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
