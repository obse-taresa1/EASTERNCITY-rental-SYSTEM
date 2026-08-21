const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const LOG_PATH = path.join(__dirname, '..', 'logs', 'cleanup.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line);
  console.log(msg);
}

(async () => {
  try {
    // 1. Ensure a default "misc" category exists
    let miscCategory = await prisma.category.findFirst({ where: { slug: 'misc' } });
    if (!miscCategory) {
      miscCategory = await prisma.category.create({ data: { name: 'Miscellaneous', slug: 'misc' } });
      log('Created default misc category');
    }

    // 2. Find duplicate listings by title (case‑insensitive)
    const allListings = await prisma.listing.findMany({ select: { id: true, title: true, categoryId: true } });
    const titleMap = new Map();
    const duplicates = [];
    for (const l of allListings) {
      const norm = l.title.toLowerCase().trim();
      if (titleMap.has(norm)) {
        duplicates.push(l);
      } else {
        titleMap.set(norm, l);
      }
    }
    log(`Found ${duplicates.length} duplicate listings`);
    // Delete duplicate listings (keep first occurrence)
    for (const dup of duplicates) {
      await prisma.listingImage.deleteMany({ where: { listingId: dup.id } });
      await prisma.listing.delete({ where: { id: dup.id } });
      log(`Deleted duplicate listing id=${dup.id} title='${dup.title}'`);
    }

    // 3. Verify each remaining listing has a valid category
    const remaining = await prisma.listing.findMany({ select: { id: true, title: true, categoryId: true } });
    const categoryIds = new Set((await prisma.category.findMany({ select: { id: true } })).map(c => c.id));
    for (const l of remaining) {
      if (!categoryIds.has(l.categoryId)) {
        await prisma.listing.update({ where: { id: l.id }, data: { categoryId: miscCategory.id } });
        log(`Updated listing id=${l.id} title='${l.title}' to misc category`);
      }
    }

    // 4. Ensure every listing has at least one image (placeholder already exists)
    const listingsNoImg = await prisma.listing.findMany({
      where: { listingImage: { none: {} } },
      select: { id: true, title: true }
    });
    const placeholderUrl = '/uploads/listings/placeholder.jpg';
    for (const l of listingsNoImg) {
      await prisma.listingImage.create({ data: { listingId: l.id, imageUrl: placeholderUrl, sortOrder: 0 } });
      log(`Added placeholder image to listing id=${l.id} title='${l.title}'`);
    }

    log('Cleanup completed successfully');
  } catch (e) {
    log('ERROR: ' + e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
