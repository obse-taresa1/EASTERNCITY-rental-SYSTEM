require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const LOG_PATH = path.join(__dirname, '..', 'logs', 'cleanup_v2.log');
function log(msg){
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_PATH, line);
  console.log(msg);
}

(async () => {
  try {
    // Ensure misc category exists
    let misc = await prisma.category.findFirst({ where: { slug: 'misc' } });
    if (!misc) {
      misc = await prisma.category.create({ data: { name: 'Miscellaneous', slug: 'misc' } });
      log('Created misc category');
    }

    // Get all listings
    const all = await prisma.listing.findMany({ select: { id: true, title: true, categoryId: true } });
    const seen = new Map();
    const duplicates = [];
    for (const l of all) {
      const key = l.title.trim().toLowerCase();
      if (seen.has(key)) {
        duplicates.push(l);
      } else {
        seen.set(key, l);
      }
    }
    log(`Found ${duplicates.length} duplicate listings`);

    // Delete related Promotion records for duplicates first (to satisfy FK RESTRICT)
    for (const dup of duplicates) {
      const promoDel = await prisma.promotion.deleteMany({ where: { listingId: dup.id } });
      if (promoDel.count) log(`Deleted ${promoDel.count} promotion(s) for duplicate id=${dup.id}`);
    }

    // Now delete duplicate listings and their images
    for (const dup of duplicates) {
      await prisma.listingImage.deleteMany({ where: { listingId: dup.id } });
      await prisma.listing.delete({ where: { id: dup.id } });
      log(`Deleted duplicate listing id=${dup.id} title='${dup.title}'`);
    }

    // Fix category references for remaining listings
    const remaining = await prisma.listing.findMany({ select: { id: true, title: true, categoryId: true } });
    const validCatIds = new Set((await prisma.category.findMany({ select: { id: true } })).map(c=>c.id));
    for (const l of remaining) {
      if (!validCatIds.has(l.categoryId)) {
        await prisma.listing.update({ where: { id: l.id }, data: { categoryId: misc.id } });
        log(`Reassigned listing id=${l.id} title='${l.title}' to misc category`);
      }
    }

    // Ensure every listing has at least one image (placeholder already exists)
    const noImg = await prisma.listing.findMany({ where: { images: { none: {} } }, select: { id: true, title: true } });
    const placeholder = '/uploads/listings/placeholder.jpg';
    for (const l of noImg) {
      await prisma.listingImage.create({ data: { listingId: l.id, imageUrl: placeholder, sortOrder: 0 } });
      log(`Added placeholder to listing id=${l.id} title='${l.title}'`);
    }

    log('Cleanup v2 completed');
  } catch (e) {
    log('ERROR: ' + e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
