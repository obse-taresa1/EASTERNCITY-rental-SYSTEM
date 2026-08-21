require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const listings = await prisma.listing.findMany({ take: 5 });
  console.log(listings);
}
run().finally(() => prisma.$disconnect());
