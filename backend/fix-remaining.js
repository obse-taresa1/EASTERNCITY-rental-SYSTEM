const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FALLBACK_CATEGORY_IMAGES = {
  'fashion-accessories': 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1200&auto=format&fit=crop',
  'travel-camping': 'https://images.unsplash.com/photo-1504280387937-31f47847c234?q=80&w=1200&auto=format&fit=crop',
};

async function fixRemaining() {
  const listings = await prisma.listing.findMany({
    include: { category: true, images: true }
  });

  let fixedCount = 0;
  for (const listing of listings) {
    if (!listing.images || listing.images.length === 0) {
       let bestImage = null;
       if (listing.category && FALLBACK_CATEGORY_IMAGES[listing.category.slug]) {
           bestImage = FALLBACK_CATEGORY_IMAGES[listing.category.slug];
       } else {
           bestImage = 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1200&auto=format&fit=crop';
       }

       console.log(`Fixing missing image for ${listing.title}`);
       await prisma.listingImage.create({
            data: {
                listingId: listing.id,
                imageUrl: bestImage,
                sortOrder: 0
            }
       });
       fixedCount++;
    }
  }
  console.log(`Fixed ${fixedCount} listings with missing images.`);
  await prisma.$disconnect();
}

fixRemaining().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
