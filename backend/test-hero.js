const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.heroPromotion.count();
  console.log('Total:', count);
  const all = await prisma.heroPromotion.findMany();
  console.log(JSON.stringify(all, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
