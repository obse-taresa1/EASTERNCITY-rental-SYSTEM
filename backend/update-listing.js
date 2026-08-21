const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the listing
  const listing = await prisma.listing.findFirst({
    where: { title: { contains: 'Leather Travel Bag' } }
  });

  if (!listing) {
    console.log('Listing not found');
    return;
  }

  console.log('Found listing:', listing.title, listing.id);

  // Update listing
  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      title: 'Harari Wedding Dress',
      pricePerDay: 8000,
      description: 'Stunning Harari wedding dress for rent. Perfect for traditional ceremonies and celebrations.',
    }
  });

  // Delete existing images
  await prisma.listingImage.deleteMany({
    where: { listingId: listing.id }
  });

  // Add new images
  await prisma.listingImage.createMany({
    data: [
      {
        listingId: listing.id,
        imageUrl: '/uploads/listings/final/harari-dress/1.png',
        sortOrder: 0
      },
      {
        listingId: listing.id,
        imageUrl: '/uploads/listings/final/harari-dress/2.jpg',
        sortOrder: 1
      }
    ]
  });

  console.log('Listing updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
