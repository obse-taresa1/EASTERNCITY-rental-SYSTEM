const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

(async () => {
  const listings = await prisma.listing.findMany({ select: { id: true, title: true } });
  let totalListings = listings.length;
  let okCount = 0;
  let issues = [];
  for (const lst of listings) {
    const images = await prisma.listingImage.findMany({ where: { listingId: lst.id }, select: { imageUrl: true, sortOrder: true } });
    const urls = images.map(i => i.imageUrl);
    const uniqueUrls = new Set(urls);
    if (urls.length !== 4) {
      issues.push({ id: lst.id, title: lst.title, problem: `Expected 4 images, found ${urls.length}` });
      continue;
    }
    if (uniqueUrls.size !== 4) {
      issues.push({ id: lst.id, title: lst.title, problem: `Duplicate images detected (${urls.length - uniqueUrls.size} duplicates)` });
      continue;
    }
    okCount++;
  }
  const report = {
    timestamp: new Date().toISOString(),
    totalListings,
    okCount,
    issueCount: issues.length,
    issues,
  };
  const outPath = path.join(__dirname, '..', 'logs', 'image_verification_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Verification completed. Report saved to', outPath);
  console.log(`✅ ${okCount}/${totalListings} listings have correct images.`);
  if (issues.length) {
    console.log(`⚠️ ${issues.length} listings have issues:`);
    issues.slice(0, 10).forEach(i => console.log(`- ${i.title}: ${i.problem}`));
    if (issues.length > 10) console.log(`...and ${issues.length - 10} more.`);
  }
  await prisma.$disconnect();
})();
