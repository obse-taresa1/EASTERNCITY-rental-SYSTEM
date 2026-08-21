require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const listings = await prisma.listing.findMany({
    where: {
      title: {
        contains: "sadheta",
        mode: "insensitive"
      }
    }
  });
  console.log("Found listings with sadheta:", listings.map(l => l.title));
  
  const allListings = await prisma.listing.findMany();
  console.log("All listings count:", allListings.length);
}
run().finally(() => prisma.$disconnect());
