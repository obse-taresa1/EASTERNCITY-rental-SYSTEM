const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.listing.count();
  console.log('Listing count:', count);
}
main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
