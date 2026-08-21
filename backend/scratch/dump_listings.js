const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      images: true,
      category: {
        select: {
          name: true
        }
      }
    }
  });
  fs.writeFileSync('listings_dump.json', JSON.stringify(listings, null, 2));
  console.log('Dumped ' + listings.length + ' listings.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
