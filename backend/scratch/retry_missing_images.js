// Uses duckduckgo-images-api (already installed) to find product images
// Then downloads them with native fetch (Node 22)
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { image_search } = require('duckduckgo-images-api');

const prisma = new PrismaClient();
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads', 'listings', 'final');

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-+||-+$/g, '');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadImage(url, filePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2048) throw new Error('Image too small');
    fs.writeFileSync(filePath, buf);
    return true;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

async function getImagesForProduct(title) {
  // Search DuckDuckGo for product images
  const queries = [
    `${title} product photo`,
    `${title} side view`,
    `${title} back view`,
    `${title} closeup detail`
  ];

  const urls = [];
  const usedUrls = new Set();

  for (const query of queries) {
    try {
      const results = await image_search({ query, moderate: true });
      // Find first result not already used
      for (const r of results) {
        if (r.image && !usedUrls.has(r.image) && (r.image.startsWith('https://') || r.image.startsWith('http://'))) {
          usedUrls.add(r.image);
          urls.push(r.image);
          break;
        }
      }
    } catch (e) {
      console.error(`    DDG search failed for "${query}": ${e.message}`);
    }
    await delay(1000); // Be polite to DDG
  }
  return urls;
}

(async () => {
  try {
    // Find all listings that need images (have no images or zero images in DB)
    const listings = await prisma.listing.findMany({ select: { id: true, title: true } });
    const toProcess = [];

    for (const lst of listings) {
      const imgs = await prisma.listingImage.findMany({
        where: { listingId: lst.id },
        select: { imageUrl: true }
      });
      // Process if: no images, or all images are placeholders, or has any placeholder
      const hasPlaceholder = imgs.some(i => i.imageUrl.includes('placeholder'));
      const hasNoImages = imgs.length === 0;
      const allSame = imgs.length > 1 && new Set(imgs.map(i => i.imageUrl)).size === 1;
      if (hasPlaceholder || hasNoImages || allSame) {
        toProcess.push(lst);
      }
    }

    console.log(`\n=== Processing ${toProcess.length} listings needing images ===\n`);
    let success = 0, partial = 0, failed = 0;

    for (let idx = 0; idx < toProcess.length; idx++) {
      const { id, title } = toProcess[idx];
      const slug = slugify(title);
      const targetDir = path.join(UPLOADS_ROOT, slug);
      fs.mkdirSync(targetDir, { recursive: true });

      console.log(`[${idx + 1}/${toProcess.length}] Processing "${title}"...`);

      // Get image URLs from DDG
      const imageUrls = await getImagesForProduct(title);

      if (imageUrls.length === 0) {
        console.log(`  ❌ No images found for "${title}"`);
        failed++;
        continue;
      }

      // Delete existing entries
      await prisma.listingImage.deleteMany({ where: { listingId: id } });

      const suffixes = ['front', 'side', 'rear', 'detail'];
      let savedCount = 0;

      for (let i = 0; i < Math.min(imageUrls.length, 4); i++) {
        const suffix = suffixes[i];
        const fileName = `${suffix}.jpg`;
        const filePath = path.join(targetDir, fileName);
        const relUrl = `/uploads/listings/final/${slug}/${fileName}`;

        try {
          await downloadImage(imageUrls[i], filePath);
          await prisma.listingImage.create({
            data: { listingId: id, imageUrl: relUrl, sortOrder: i + 1 }
          });
          savedCount++;
        } catch (e) {
          console.log(`    ⚠️ Download failed for ${suffix}: ${e.message}`);
        }
      }

      if (savedCount === 4) {
        console.log(`  ✅ 4/4 images saved`);
        success++;
      } else if (savedCount > 0) {
        console.log(`  ⚠️ ${savedCount}/4 images saved`);
        partial++;
      } else {
        console.log(`  ❌ 0/4 images saved`);
        failed++;
      }

      await delay(2000); // Pause between listings
    }

    console.log(`\n=== RESULTS ===`);
    console.log(`✅ Full success: ${success}`);
    console.log(`⚠️ Partial: ${partial}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${toProcess.length}`);
  } catch (err) {
    console.error('❌ Fatal:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
