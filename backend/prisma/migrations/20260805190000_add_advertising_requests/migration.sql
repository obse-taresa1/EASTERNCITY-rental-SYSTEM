CREATE TABLE "AdvertisingRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "website" TEXT,
    "socialMedia" TEXT,
    "campaignGoal" TEXT,
    "campaignMessage" TEXT NOT NULL,
    "preferredStartDate" TIMESTAMP(3),
    "preferredEndDate" TIMESTAMP(3),
    "bannerUrl" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdvertisingRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdvertisingRequest_reference_key" ON "AdvertisingRequest"("reference");
CREATE INDEX "AdvertisingRequest_status_idx" ON "AdvertisingRequest"("status");
CREATE INDEX "AdvertisingRequest_createdAt_idx" ON "AdvertisingRequest"("createdAt");
