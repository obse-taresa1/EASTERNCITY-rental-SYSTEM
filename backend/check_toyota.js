require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    where: { title: { contains: 'Toyota' } }
  });
  console.log(listings.map(l => l.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());
