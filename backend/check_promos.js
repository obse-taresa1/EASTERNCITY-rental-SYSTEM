require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const promos = await prisma.heroPromotion.findMany();
  console.log("Hero promos:", promos.length);
}
run().finally(() => prisma.$disconnect());
