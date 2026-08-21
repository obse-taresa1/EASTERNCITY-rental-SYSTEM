const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    take: 5,
    include: { images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  for (const l of listings) {
    console.log(`\n=== ${l.title} (${l.id}) ===`);
    console.log(`  Image count: ${l.images.length}`);
    for (const img of l.images) {
      console.log(`  [sortOrder=${img.sortOrder}] ${img.imageUrl}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
