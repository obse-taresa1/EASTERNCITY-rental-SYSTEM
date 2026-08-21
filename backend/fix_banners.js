const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createBannerAd } = require('./src/services/bannerAdService');

async function fix() {
  const requests = await prisma.advertisingRequest.findMany({ where: { status: 'APPROVED' } });
  let count = 0;
  for (const updated of requests) {
    if (!updated.bannerUrl) continue;
    
    // Check if a banner with this company name already exists
    const ads = await require('./src/services/bannerAdService').getAllBannerAds();
    const exists = ads.some(ad => ad.companyName === updated.companyName && ad.imageUrl === updated.bannerUrl);
    
    if (!exists) {
      await createBannerAd(null, {
        title: updated.companyName,
        companyName: updated.companyName,
        subtitle: (updated.campaignMessage || updated.campaignGoal || "").slice(0, 140),
        imageUrl: updated.bannerUrl,
        ctaLabel: "Explore now",
        ctaUrl: updated.website || "",
        startDate: updated.preferredStartDate ? updated.preferredStartDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        endDate: updated.preferredEndDate ? updated.preferredEndDate.toISOString().slice(0, 10) : "",
        isActive: "true",
        status: "ACTIVE",
      });
      count++;
      console.log('Created missing banner for', updated.companyName);
    }
  }
  console.log('Fixed banners:', count);
}
fix().catch(console.error).finally(() => prisma.$disconnect());
