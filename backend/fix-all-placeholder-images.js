const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Image sets per category – high‑quality Unsplash placeholders (already curated for the main items)
const imageSets = {
  car: [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop"
  ],
  electronics: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&h=600&fit=crop"
  ],
  baby: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555252834-0bd6a83cc770?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=600&fit=crop"
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop"
  ],
  event: [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1530103862676-de8892b07b10?w=800&h=600&fit=crop"
  ],
  fashion: [
    "https://images.unsplash.com/photo-1550639524-a6f58345a278?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop"
  ],
  general: [
    "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&h=600&fit=crop"
  ]
};

function getCategory(title) {
  const lower = title.toLowerCase();
  if (lower.match(/toyota|nissan|hyundai|ford|car|pickup|suv|van|truck/)) return 'car';
  if (lower.match(/camera|laptop|phone|speaker|playstation|xbox|nintendo|monitor|printer|projector/)) return 'electronics';
  if (lower.match(/baby|crib|stroller|playpen|car seat|high chair|walker/)) return 'baby';
  if (lower.match(/sofa|table|chair|desk|wardrobe|bed|furniture/)) return 'furniture';
  if (lower.match(/tent|event|wedding|banquet|catering|party|stage|light|sound/)) return 'event';
  if (lower.match(/dress|suit|bag|shoe|fashion/)) return 'fashion';
  return 'general';
}

async function main() {
  try {
    const listings = await p.listing.findMany({ include: { images: true } });
    let updated = 0;
    for (const l of listings) {
      // Detect placeholder images: picsum.photos OR any path that still points to the source assets folder
      const hasPlaceholder = l.images.some(i =>
        i.imageUrl.includes('picsum.photos') || i.imageUrl.includes('/src/assets/') || i.imageUrl.includes('placeholder')
      );
      if (hasPlaceholder) {
        const cat = getCategory(l.title);
        const images = imageSets[cat] || imageSets['general'];
        // Remove old images for this listing
        await p.listingImage.deleteMany({ where: { listingId: l.id } });
        // Insert the new set (4 images)
        const imageData = images.map((url, idx) => ({ listingId: l.id, imageUrl: url, sortOrder: idx }));
        await p.listingImage.createMany({ data: imageData });
        console.log(`Updated [${l.title}] → category ${cat}`);
        updated++;
      }
    }
    console.log(`Finished. Updated ${updated} listings.`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await p.$disconnect();
  }
}

main();
