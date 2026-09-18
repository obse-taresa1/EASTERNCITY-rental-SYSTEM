const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicateImage() {
  const listing = await prisma.listing.findFirst({
    where: { title: 'Harari Wedding Dress' }
  });

  if (!listing) {
    console.log("Listing not found.");
    return;
  }

  // Delete the '2.jpg' image, keeping '3.jpg' (the new one) and '1.png' (the face covered one)
  const deleted = await prisma.listingImage.deleteMany({
    where: {
      listingId: listing.id,
      imageUrl: {
        contains: '2.jpg'
      }
    }
  });

  console.log(`Deleted ${deleted.count} duplicate image(s).`);

  // Ensure the remaining images are sorted properly
  const remainingImages = await prisma.listingImage.findMany({
    where: { listingId: listing.id },
    orderBy: { sortOrder: 'asc' }
  });

  for (let i = 0; i < remainingImages.length; i++) {
    await prisma.listingImage.update({
      where: { id: remainingImages[i].id },
      data: { sortOrder: i }
    });
  }
  
  console.log("Images reordered successfully.");
}

removeDuplicateImage().finally(() => prisma.$disconnect());
