DELETE FROM "Review";

ALTER TABLE "Review" ADD COLUMN "bookingId" TEXT NOT NULL;

CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

ALTER TABLE "Review"
ADD CONSTRAINT "Review_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;