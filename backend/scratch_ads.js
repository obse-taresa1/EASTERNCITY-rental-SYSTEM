const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "homepageBannerAds" } });
  console.log(JSON.stringify(JSON.parse(setting?.value || "[]"), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
