const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'rahmasala763@gmail.com' },
      include: { listings: { include: { category: true } } }
    });

    if (!user) {
      console.log('User not found!');
      return;
    }

    const listings = user.listings.slice(0, 3);
    console.log(`Found ${listings.length} listings. Creating HeroPromotions...`);

    for (let listing of listings) {
      const existing = await prisma.heroPromotion.findMany({ where: { listingId: listing.id } });
      if (existing.length > 0) {
        console.log(`Hero promotion already exists for listing ${listing.title}`);
        continue;
      }

      const imageUrl = listing.images && listing.images.length > 0 ? (listing.images[0].imageUrl || listing.images[0].url) : '';
      const originalPrice = Number(listing.price || 0);

      const hp = await prisma.heroPromotion.create({
        data: {
          title: listing.title,
          description: "Don't miss this amazing offer. Book today and enjoy premium quality service.",
          heroImage: imageUrl || '',
          productService: listing.category?.name || 'Rentals',
          cardImage: imageUrl || '',
          location: listing.location || 'All Cities',
          rating: '4.9',
          originalPrice: originalPrice,
          discountPercent: 15,
          discountedPrice: originalPrice * 0.85,
          ctaText: 'View Details',
          ctaLink: `/items/${listing.id}`,
          listingId: listing.id,
          startDate: new Date(),
          isActive: true,
          displayOrder: 0
        }
      });
      console.log(`Created HeroPromotion for ${listing.title} (ID: ${hp.id})`);
    }

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
