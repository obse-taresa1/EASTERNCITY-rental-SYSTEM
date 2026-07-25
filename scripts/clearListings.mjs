import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
  console.log('Clearing old listings...');
  await prisma.booking.deleteMany({});
  await prisma.listingImage.deleteMany({});
  await prisma.listing.deleteMany({});
  
  console.log('Clearing old owners created by script...');
  // Keep admin
  await prisma.user.deleteMany({
    where: { email: { not: 'rahmasala663@gmail.com' } }
  });
  console.log('✅ Cleanup complete!');
  process.exit(0);
}

clear();
