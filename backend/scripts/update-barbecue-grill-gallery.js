require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const listingId = "f80c4e04-f668-4d7a-9248-6cdd31f1af6d";
const imageUrls = [
  "/uploads/listings/generated/barbecue-grill/barbecue-grill-v2-front.png",
  "/uploads/listings/generated/barbecue-grill/barbecue-grill-v2-side.png",
  "/uploads/listings/generated/barbecue-grill/barbecue-grill-v2-rear.png",
  "/uploads/listings/generated/barbecue-grill/barbecue-grill-v2-detail.png",
];

async function main() {
  const updates = await prisma.$transaction(
    imageUrls.map((imageUrl, sortOrder) =>
      prisma.listingImage.updateMany({
        where: { listingId, sortOrder },
        data: { imageUrl },
      }),
    ),
  );

  const updated = updates.reduce((total, result) => total + result.count, 0);
  if (updated !== imageUrls.length) {
    throw new Error(`Expected ${imageUrls.length} listing images, updated ${updated}.`);
  }

  console.log("Barbecue Grill gallery updated with four high-resolution images.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
