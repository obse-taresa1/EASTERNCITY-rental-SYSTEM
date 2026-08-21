const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const [listingId, gallerySlug] = process.argv.slice(2);

if (!listingId || !gallerySlug) {
  throw new Error("Usage: node scripts/replace-listing-with-curated-gallery.js <listing-id> <gallery-slug>");
}

const galleryDirectory = path.join(__dirname, "..", "uploads", "listings", "curated", gallerySlug);
const galleryFiles = ["front.jpg", "side.jpg", "rear.jpg", "control-panel.jpg"];

for (const filename of galleryFiles) {
  if (!fs.existsSync(path.join(galleryDirectory, filename))) {
    throw new Error(`Missing curated asset: ${path.join(galleryDirectory, filename)}`);
  }
}

const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error(`Listing ${listingId} was not found.`);

  const images = galleryFiles.map((filename, sortOrder) => ({
    imageUrl: `/uploads/listings/curated/${gallerySlug}/${filename}`,
    sortOrder,
  }));

  await prisma.$transaction([
    prisma.listingImage.deleteMany({ where: { listingId } }),
    prisma.listingImage.createMany({ data: images.map((image) => ({ ...image, listingId })) }),
  ]);

  console.log(`Updated ${listing.title} with curated gallery: ${gallerySlug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
