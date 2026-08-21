const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findFirst({ where: { title: 'Harari Wedding Dress' } });
  if (!listing) { console.log('Not found!'); return; }

  // Swap images: put the full-body shot (2.jpg) first, dramatic close-up (1.png) second
  await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
  await prisma.listingImage.createMany({
    data: [
      { listingId: listing.id, imageUrl: '/uploads/listings/final/harari-dress/2.jpg', sortOrder: 0 },
      { listingId: listing.id, imageUrl: '/uploads/listings/final/harari-dress/1.png', sortOrder: 1 },
    ]
  });
  console.log('Harari Wedding Dress images reordered ✓');
}

main().catch(console.error).finally(() => prisma.$disconnect());
