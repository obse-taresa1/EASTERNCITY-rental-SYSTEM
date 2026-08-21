const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Paths
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads', 'listings');
const CURATED_ROOT = path.join(UPLOADS_ROOT, 'curated');
const FINAL_ROOT = path.join(UPLOADS_ROOT, 'final');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_PATH = path.join(LOG_DIR, 'fix_images.log');

// Ensure directories exist
fs.mkdirSync(FINAL_ROOT, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

// Load curated image library
let curatedLibrary = {};
try {
  const libPath = path.join(__dirname, '..', 'data', 'curated-image-library.json');
  curatedLibrary = JSON.parse(fs.readFileSync(libPath, 'utf8'));
} catch (e) {
  console.error('Failed to load curated-image-library.json', e);
  process.exit(1);
}

// Helper: clean title for matching
function cleanTitle(title) {
  return title
    .toLowerCase()
    .replace(/\b(500\s?pax|kit|set|professional|heavy\s?duty|portable|modern|premium|luxury|industrial|commercial|adjustable)\b/gi, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

// Helper: find curated entry
function findCuratedEntry(title) {
  const cleaned = cleanTitle(title);
  // exact key match
  if (curatedLibrary[cleaned]) return curatedLibrary[cleaned];
  // fallback: find any key that is substring of cleaned title
  for (const key of Object.keys(curatedLibrary)) {
    if (cleaned.includes(key)) return curatedLibrary[key];
  }
  // fallback: find any key that cleaned includes (reverse)
  for (const key of Object.keys(curatedLibrary)) {
    if (key.includes(cleaned)) return curatedLibrary[key];
  }
  return null;
}

// Logging utility
function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_PATH, line);
  console.log(message);
}

(async () => {
  try {
    const listings = await prisma.listing.findMany({ select: { id: true, title: true } });
    log(`Processing ${listings.length} listings`);
    for (const listing of listings) {
      const entry = findCuratedEntry(listing.title);
      const destDir = path.join(FINAL_ROOT, listing.id);
      fs.mkdirSync(destDir, { recursive: true });

      // Remove old images for this listing
      await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });

      if (entry && entry.images && entry.images.length > 0) {
        // Use curated images
        let idx = 0;
        for (const img of entry.images) {
          // img.url contains the web path; convert to filesystem path
          const srcPath = path.join(__dirname, '..', img.url.replace(/^\/uploads/, 'uploads'));
          const filename = path.basename(img.url);
          const destPath = path.join(destDir, filename);
          try {
            await fs.promises.copyFile(srcPath, destPath);
            const dbUrl = `/uploads/listings/final/${listing.id}/${filename}`;
            await prisma.listingImage.create({ data: { listingId: listing.id, imageUrl: dbUrl, sortOrder: idx } });
            idx++;
          } catch (e) {
            log(`Failed to copy curated image for listing '${listing.title}' from ${srcPath}: ${e.message}`);
          }
        }
        log(`✅ Updated '${listing.title}' with ${idx} curated images`);
      } else {
        // No curated entry – fall back to existing images, dedupe, or placeholder
        const existing = await prisma.listingImage.findMany({ where: { listingId: listing.id } });
        const unique = [];
        const seen = new Set();
        for (const img of existing) {
          if (!seen.has(img.imageUrl)) {
            seen.add(img.imageUrl);
            unique.push(img.imageUrl);
          }
        }
        if (unique.length === 0) {
          // Use placeholder
          const placeholderUrl = '/uploads/listings/placeholder.jpg';
          await prisma.listingImage.create({ data: { listingId: listing.id, imageUrl: placeholderUrl, sortOrder: 0 } });
          log(`⚠️ No images for '${listing.title}'. Assigned placeholder.`);
        } else {
          // Insert deduped images (maintain order)
          for (let i = 0; i < unique.length; i++) {
            await prisma.listingImage.create({ data: { listingId: listing.id, imageUrl: unique[i], sortOrder: i } });
          }
          log(`🔧 '${listing.title}' kept ${unique.length} existing unique images`);
        }
      }
    }
    log('✅ Image fixing completed for all listings');
  } catch (err) {
    log('❌ Unexpected error: ' + err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
