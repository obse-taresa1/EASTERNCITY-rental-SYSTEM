CREATE TABLE "ContactMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "adminReply" TEXT,
  "repliedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ContactMessage"
  ADD CONSTRAINT "ContactMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ContactMessage_userId_idx" ON "ContactMessage"("userId");
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");
