ALTER TABLE "AdvertisingRequest"
  ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentSubmittedAt" TIMESTAMP(3);
