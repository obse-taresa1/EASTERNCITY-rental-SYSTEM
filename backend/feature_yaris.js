require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const yaris = await prisma.listing.findFirst({
    where: { title: "Toyota Yaris" }
  });
  
  if (!yaris) {
    console.log("Toyota Yaris not found!");
    return;
  }
  
  // Check if it's already featured
  let featured = await prisma.featuredListing.findFirst({
    where: { listingId: yaris.id }
  });
  
  if (!featured) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    featured = await prisma.featuredListing.create({
      data: {
        listingId: yaris.id,
        startDate: new Date(),
        endDate: nextMonth,
        isActive: true
      }
    });
    console.log("Created featured listing for Yaris!");
  } else {
    console.log("Yaris is already featured!");
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
