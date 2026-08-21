const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cats = await prisma.category.findMany();
  console.log(cats);
}

run().finally(() => prisma.$disconnect());
