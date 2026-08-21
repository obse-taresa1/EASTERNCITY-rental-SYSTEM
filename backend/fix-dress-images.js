const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fix Somali Dress - ensure both images are in DB
  const somali = await prisma.listing.findFirst({ where: { title: 'Somali Dress' } });
  if (somali) {
    await prisma.listingImage.deleteMany({ where: { listingId: somali.id } });
    await prisma.listingImage.createMany({
      data: [
        { listingId: somali.id, imageUrl: '/uploads/listings/final/somali-dress/1.jpg', sortOrder: 0 },
        { listingId: somali.id, imageUrl: '/uploads/listings/final/somali-dress/2.png', sortOrder: 1 },
      ]
    });
    console.log('Somali Dress: 2 images set ✓');
  } else {
    console.log('Somali Dress not found!');
  }

  // Fix Sadeta Harage Dress - ensure both images are in DB
  const sadeta = await prisma.listing.findFirst({ where: { title: 'Sadeta Harage Dress' } });
  if (sadeta) {
    await prisma.listingImage.deleteMany({ where: { listingId: sadeta.id } });
    await prisma.listingImage.createMany({
      data: [
        { listingId: sadeta.id, imageUrl: '/uploads/listings/final/sadeta-harage-dress/1.jpg', sortOrder: 0 },
        { listingId: sadeta.id, imageUrl: '/uploads/listings/final/sadeta-harage-dress/2.jpg', sortOrder: 1 },
      ]
    });
    console.log('Sadeta Harage Dress: 2 images set ✓');
  } else {
    console.log('Sadeta Harage Dress not found!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
