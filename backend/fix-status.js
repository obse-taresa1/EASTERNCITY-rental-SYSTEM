const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStatus() {
  await prisma.listing.updateMany({
    where: { title: 'Harari Wedding Dress' },
    data: { status: 'APPROVED' }
  });
  console.log("Status updated to APPROVED!");
}

fixStatus().finally(() => prisma.$disconnect());
