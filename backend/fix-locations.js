const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Add neighbourhood to listings that only show city
  const updates = [
    { title: 'Modern Sectional Sofa', city: 'Dire Dawa', location: 'Kezira' },
    { title: 'Canon EOS DSLR Kit', city: 'Jigjiga', location: 'Suuq Madow (Kebele 01)' },
    { title: 'Gaming Laptop RTX 4070', city: 'Dire Dawa', location: 'Kezira' },
    { title: 'Toyota RAV4 2023', city: 'Jigjiga', location: 'Suuq Madow (Kebele 01)' },
  ];

  for (const u of updates) {
    const res = await prisma.listing.updateMany({
      where: { title: u.title },
      data: { location: u.location, city: u.city }
    });
    console.log(`Updated ${u.title}: ${res.count} record(s)`);
  }

  // Remove these 4 from staffRecommended (they should not appear on homepage)
  const titlesToRemove = ['Modern Sectional Sofa', 'Canon EOS DSLR Kit', 'Gaming Laptop RTX 4070', 'Toyota RAV4 2023'];
  await prisma.listing.updateMany({
    where: { title: { in: titlesToRemove } },
    data: { staffRecommended: false }
  });
  console.log('Removed 4 test items from homepage featured list.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
