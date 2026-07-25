const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const count = await prisma.listing.count();
  const users = await prisma.user.count();
  console.log('Total listings in DB:', count);
  console.log('Total users in DB:', users);
}
check().finally(() => prisma.$disconnect());
