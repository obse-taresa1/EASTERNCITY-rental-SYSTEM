const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const listing = await prisma.listing.findFirst({
    where: { title: 'Harari Wedding Dress' },
    include: {
      category: true,
      images: true,
      owner: true
    }
  });

  if (!listing) {
    console.log("❌ Harari Wedding Dress NOT FOUND in database.");
  } else {
    console.log("✅ Harari Wedding Dress FOUND!");
    console.log("ID:", listing.id);
    console.log("Status:", listing.status);
    console.log("Staff Recommended:", listing.staffRecommended);
    console.log("Category:", listing.category?.name);
    console.log("Images Count:", listing.images.length);
    console.log("Images:", listing.images.map(i => i.imageUrl).join(", "));
  }
}

checkData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
