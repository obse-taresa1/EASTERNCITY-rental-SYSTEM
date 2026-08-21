const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const heroService = require('./src/services/heroPromotionService');

async function main() {
  const approvedHeroPromos = await prisma.promotion.findMany({
    where: {
      status: 'APPROVED',
      placement: { in: ['HERO_PROMOTION', 'HERO_SECTION'] }
    }
  });

  console.log(`Found ${approvedHeroPromos.length} approved hero promotions`);
  
  for (const promo of approvedHeroPromos) {
    try {
      console.log(`Syncing promotion ${promo.id}...`);
      await heroService.createFromPromotion(promo);
      console.log(`Done syncing ${promo.id}`);
    } catch (e) {
      console.error(`Error syncing ${promo.id}:`, e);
    }
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
