const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { startsWith: 'Integration', mode: 'insensitive' } },
        { title: { startsWith: 'Test', mode: 'insensitive' } },
        { title: { startsWith: 'Demo', mode: 'insensitive' } },
      ]
    },
    select: { id: true }
  });

  if (listings.length > 0) {
    const ids = listings.map(l => l.id);
    
    // Delete images
    await prisma.listingImage.deleteMany({
      where: { listingId: { in: ids } }
    });
    
    // Delete bookings/reviews that might be attached
    await prisma.review.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.booking.deleteMany({ where: { listingId: { in: ids } } });

    // Delete listings
    const deleted = await prisma.listing.deleteMany({
      where: { id: { in: ids } }
    });
    console.log(`Deleted ${deleted.count} placeholder listings.`);
  } else {
    console.log("No placeholder listings found.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
