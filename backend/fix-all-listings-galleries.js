const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Convert a title into the folder name used for curated images.
function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // strip illegal characters
    .replace(/\s+/g, '-') // spaces → hyphen
    .replace(/-+/g, '-'); // collapse multiple hyphens
}

// Root where the curated galleries live (relative to this file).
const CURATED_ROOT = path.resolve(__dirname, 'uploads', 'listings', 'curated');

async function main() {
  try {
    await prisma.$connect();
    const listings = await prisma.listing.findMany({ include: { images: true } });
    let processed = 0;

    for (const listing of listings) {
      const slug = slugify(listing.title);
      const galleryPath = path.join(CURATED_ROOT, slug);
      let chosenImages = [];

      // If a curated folder exists, use the first 4 images (different angles).
      if (fs.existsSync(galleryPath) && fs.lstatSync(galleryPath).isDirectory()) {
        const files = fs
          .readdirSync(galleryPath)
          .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
          .sort();
        if (files.length >= 4) {
          chosenImages = files.slice(0, 4).map(f => `/uploads/listings/curated/${slug}/${f}`);
        }
      }

      // Always clear the current images first – this removes mismatched placeholders.
      await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });

      if (chosenImages.length === 0) {
        console.warn(`Cleared images for [${listing.title}] – no curated gallery present`);
        // No images left for this listing; move on.
        processed++;
        continue;
      }

      const imageData = chosenImages.map((url, idx) => ({
        listingId: listing.id,
        imageUrl: url,
        sortOrder: idx,
      }));
      await prisma.listingImage.createMany({ data: imageData });
      console.log(`Set curated gallery for [${listing.title}] – ${chosenImages.length} images`);
      processed++;
    }

    console.log(`Finished. Processed ${processed} listings.`);
  } catch (e) {
    console.error('Error during gallery clean‑up:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
