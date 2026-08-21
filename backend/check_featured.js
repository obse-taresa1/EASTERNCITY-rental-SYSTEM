require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const featured = await prisma.featuredListing.findMany({
    include: { listing: true }
  });
  console.log("Featured listings:");
  featured.forEach(f => console.log(f.listing ? f.listing.title : "Unknown"));
}
run().finally(() => prisma.$disconnect());
