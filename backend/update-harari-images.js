const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHarariDress() {
  const listing = await prisma.listing.findFirst({
    where: { title: 'Harari Wedding Dress' }
  });

  if (!listing) {
    console.log("Listing not found!");
    return;
  }

  // Make it featured so it shows up on the homepage
  await prisma.listing.update({
    where: { id: listing.id },
    data: { staffRecommended: true }
  });

  // Delete existing images to re-add them in the correct order
  await prisma.listingImage.deleteMany({
    where: { listingId: listing.id }
  });

  // Add the newly uploaded image (3.jpg) and the previous ones
  await prisma.listingImage.createMany({
    data: [
      {
        listingId: listing.id,
        imageUrl: '/uploads/listings/final/harari-dress/3.jpg', // The new image the user just provided
        sortOrder: 0
      },
      {
        listingId: listing.id,
        imageUrl: '/uploads/listings/final/harari-dress/1.png', // The original face-covered image
        sortOrder: 1
      },
      {
        listingId: listing.id,
        imageUrl: '/uploads/listings/final/harari-dress/2.jpg',
        sortOrder: 2
      }
    ]
  });

  console.log("Successfully updated Harari Wedding Dress to be featured and updated its images!");
}

updateHarariDress()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
