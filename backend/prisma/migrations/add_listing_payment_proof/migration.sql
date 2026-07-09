ALTER TABLE "Listing"
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "paymentProofUrl" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
