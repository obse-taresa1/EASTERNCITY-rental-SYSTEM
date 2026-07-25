const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function shuffleDates() {
  console.log('Shuffling createdAt dates for listings...');
  const listings = await prisma.listing.findMany({ select: { id: true } });

  // Shuffle array
  for (let i = listings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [listings[i], listings[j]] = [listings[j], listings[i]];
  }

  const baseDate = new Date();
  
  for (let i = 0; i < listings.length; i++) {
    const newDate = new Date(baseDate.getTime() - i * 3600000); // subtract hours
    await prisma.listing.update({
      where: { id: listings[i].id },
      data: { createdAt: newDate }
    });
    process.stdout.write('.');
  }

  console.log('\nDates shuffled successfully!');
  await prisma.$disconnect();
}

shuffleDates().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
