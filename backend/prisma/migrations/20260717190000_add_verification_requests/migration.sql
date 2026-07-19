ALTER TABLE "User"
ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN "city" TEXT,
ADD COLUMN "sefer" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "nationalIdFrontUrl" TEXT,
ADD COLUMN "nationalIdBackUrl" TEXT;

CREATE TABLE "VerificationRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "sefer" TEXT NOT NULL,
  "address" TEXT,
  "nationalIdFrontUrl" TEXT NOT NULL,
  "nationalIdBackUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationRequest_userId_idx" ON "VerificationRequest"("userId");
CREATE INDEX "VerificationRequest_status_idx" ON "VerificationRequest"("status");

ALTER TABLE "VerificationRequest"
ADD CONSTRAINT "VerificationRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VerificationRequest"
ADD CONSTRAINT "VerificationRequest_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
