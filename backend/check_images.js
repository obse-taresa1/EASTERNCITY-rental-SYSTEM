const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const imgs = await prisma.listingImage.findMany({take: 5, orderBy: {createdAt: 'desc'}});
  console.log(imgs);
}

run().finally(() => prisma.$disconnect());
