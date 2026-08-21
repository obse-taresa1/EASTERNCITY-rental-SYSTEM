require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  // Un-feature everything
  await prisma.featuredListing.deleteMany({});
  
  const sadeta = await prisma.listing.findFirst({
    where: { title: "Sadeta Harage Dress" }
  });
  
  if (!sadeta) {
    console.log("Sadeta Harage Dress not found!");
    return;
  }
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await prisma.featuredListing.create({
    data: {
      listingId: sadeta.id,
      startDate: new Date(),
      endDate: nextMonth,
      isActive: true
    }
  });
  console.log("Featured Sadeta Harage Dress!");
}
run().catch(console.error).finally(() => prisma.$disconnect());
