const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const listings = await p.listing.findMany({ include: { images: true } });
  for (const l of listings) {
    const imgStr = l.images.length > 0 ? l.images.map(i => i.imageUrl).join(', ') : 'NO IMAGES';
    console.log(`[${l.title}] -> ${imgStr}`);
  }
}
main().finally(() => p.$disconnect());
