const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper: slugify title to match folder naming (lowercase, spaces/hyphens, remove non‑alphanum)
function slugify(str) {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace to hyphen
    .replace(/-+/g, '-'); // collapse multiple hyphens
}

// Base folder where curated galleries are stored (relative to project root)
// Adjusted to backend/uploads/listings/curated as that is where the assets exist
const CURATED_ROOT = path.resolve(__dirname, 'uploads', 'listings', 'curated');

async function main() {
  try {
    const listings = await prisma.listing.findMany({ include: { images: true } });
    let updated = 0;
    for (const listing of listings) {
      const slug = slugify(listing.title);
      const galleryPath = path.join(CURATED_ROOT, slug);
      if (!fs.existsSync(galleryPath) || !fs.lstatSync(galleryPath).isDirectory()) {
        // No curated gallery for this listing – skip it
        continue;
      }
      // Read image files (filter to common image extensions) and sort to get consistent order
      const files = fs.readdirSync(galleryPath)
        .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
        .sort();
      if (files.length < 4) {
        console.warn(`Skipping [${listing.title}] – only ${files.length} images in ${galleryPath}`);
        continue;
      }
      const selected = files.slice(0, 4);
      // Delete old images for this listing
      await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
      // Insert new images with proper URL path (served from /uploads/...)
      const imageData = selected.map((fileName, idx) => ({
        listingId: listing.id,
        imageUrl: `/uploads/listings/curated/${slug}/${fileName}`,
        sortOrder: idx,
      }));
      await prisma.listingImage.createMany({ data: imageData });
      console.log(`Updated [${listing.title}] → using curated gallery (${slug})`);
      updated++;
    }
    console.log(`Finished. Updated ${updated} listings with curated galleries.`);
  } catch (e) {
    console.error('Error during gallery fix:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
