const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Directory where listing images are stored
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads', 'listings', 'final');

// Placeholder identifier (filename used for placeholders)
const PLACEHOLDER_NAME = 'placeholder.jpg';

// Helper to slugify titles for folder names
function slugify(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '') // Remove all non-alphanumeric chars except -
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Generate image via Pollinations API
async function fetchImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image for prompt: ${prompt}`);
  return await res.buffer(); // Return raw image data
}

(async () => {
  try {
    // Find all listings whose current images are placeholders
    const listings = await prisma.listing.findMany({
      select: { id: true, title: true }
    });
    const listingsNeedingImages = [];
    for (const lst of listings) {
      const imgs = await prisma.listingImage.findMany({
        where: { listingId: lst.id },
        select: { imageUrl: true }
      });
      // If any image ends with placeholder filename, treat as missing
      if (imgs.some(i => i.imageUrl.endsWith(PLACEHOLDER_NAME))) {
        listingsNeedingImages.push({ id: lst.id, title: lst.title });
      }
    }

    console.log(`Found ${listingsNeedingImages.length} listings needing generated images.`);
    for (const { id, title } of listingsNeedingImages) {
      const slug = slugify(title);
      const targetDir = path.join(UPLOADS_ROOT, slug);
      fs.mkdirSync(targetDir, { recursive: true });

      const angles = [
        { suffix: 'front', prompt: `${title} front view product photography on white background` },
        { suffix: 'side', prompt: `${title} side view product photography on white background` },
        { suffix: 'rear', prompt: `${title} rear view product photography on white background` },
        { suffix: 'detail', prompt: `${title} close‑up detail view product photography on white background` }
      ];

      // Remove existing placeholder images for this listing
      await prisma.listingImage.deleteMany({ where: { listingId: id } });

      for (let i = 0; i < angles.length; i++) {
        const { suffix, prompt } = angles[i];
        try {
          const imgBuf = await fetchImage(prompt);
          const fileName = `${suffix}.jpg`;
          const filePath = path.join(targetDir, fileName);
          fs.writeFileSync(filePath, imgBuf);
          const relativeUrl = `/uploads/listings/final/${slug}/${fileName}`.replace(/\\/g, '/');
          await prisma.listingImage.create({
            data: {
              listingId: id,
              imageUrl: relativeUrl,
              sortOrder: i + 1
            }
          });
          console.log(`✅ Generated ${suffix} for "${title}"`);
        } catch (e) {
          console.error(`⚠️ Failed ${suffix} for "${title}": ${e.message}`);
        }
      }
    }

    console.log('✅ Image generation completed for all missing listings.');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
