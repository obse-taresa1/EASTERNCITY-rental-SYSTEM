const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

(async () => {
  const all = await p.listing.findMany({ select: { id: true, title: true } });
  const need = [];
  for (const l of all) {
    const imgs = await p.listingImage.findMany({ where: { listingId: l.id }, select: { imageUrl: true } });
    if (imgs.length === 0 || imgs.some(i => i.imageUrl.includes('placeholder'))) {
      need.push(l.title);
    }
  }
  const outPath = path.join(__dirname, 'missing_listings.json');
  fs.writeFileSync(outPath, JSON.stringify(need, null, 2));
  console.log(`${need.length} listings need images:`);
  need.forEach(t => console.log(`  - ${t}`));
  await p.$disconnect();
})();
