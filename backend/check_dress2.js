require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const listings = await prisma.listing.findMany({
    where: {
      title: {
        contains: "dress",
        mode: "insensitive"
      }
    }
  });
  console.log("Found listings with dress:", listings.map(l => l.title));
}
run().finally(() => prisma.$disconnect());
