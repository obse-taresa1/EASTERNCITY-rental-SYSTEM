const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListings() {
  const listings = await prisma.listing.findMany({
    include: { category: true, images: true }
  });

  for (const l of listings) {
    const img = l.images && l.images.length > 0 ? l.images[0].imageUrl : 'NONE';
    console.log(`[${l.category?.name}] ${l.title}`);
    console.log(`  Img: ${img}`);
  }
}

checkListings().then(() => prisma.$disconnect());
