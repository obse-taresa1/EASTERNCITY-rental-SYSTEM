const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const itemsToDelete = [
    'Playpen', 'Baby High Chair', 'Baby Walker', 
    'Child Car Seat', 'Baby Crib', 'Baby Stroller'
  ];

  const listings = await prisma.listing.findMany({
    where: { title: { in: itemsToDelete } },
    select: { id: true }
  });

  const ids = listings.map(l => l.id);

  if (ids.length > 0) {
    // Delete related records first
    await prisma.listingImage.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.booking.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.match.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.review.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.promotion.deleteMany({ where: { listingId: { in: ids } } });
    await prisma.conversation.deleteMany({ where: { listingId: { in: ids } } });
    
    // Now delete the listings
    const deleted = await prisma.listing.deleteMany({
      where: { id: { in: ids } }
    });
    console.log(`Deleted ${deleted.count} baby items.`);
  }

  // 2. Set staffRecommended = true ONLY for the items the user specified
  const featuredItems = [
    'Toyota Hiace Van', 'Cooler Box', 'Camping Chair Set', 'Banquet Tables Set',
    'Barbecue Grill', 'Wedding Tent', 'Canon DSLR Camera Kit', 'Wedding Chairs Set',
    'Portable Generator', 'Stage Platform', 'Mels Dress', 'Somali Dress',
    'Harari Wedding Dress', 'Camping Tent', 'Mountain Bike Pro', 'Hyundai Tucson SUV'
  ];

  await prisma.listing.updateMany({
    where: { staffRecommended: true },
    data: { staffRecommended: false }
  });

  const updated = await prisma.listing.updateMany({
    where: { title: { in: featuredItems } },
    data: { staffRecommended: true }
  });
  
  console.log(`Set ${updated.count} items as featured on homepage.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
