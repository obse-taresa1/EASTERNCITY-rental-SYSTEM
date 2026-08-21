require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const owners = await prisma.user.findMany({ where: { email: { endsWith: '@gmail.com' }, role: 'USER' }, select: { id: true, email: true, _count: { select: { listings: true } } } });
  const approved = await prisma.listing.findMany({ where: { status: { in: ['APPROVED', 'ACTIVE', 'FEATURED'] } }, select: { id: true, title: true, ownerId: true, categoryId: true, images: { select: { id: true, imageUrl: true } } } });
  const byCategory = new Map();
  approved.forEach((listing) => { const key = listing.categoryId || 'uncategorized'; byCategory.set(key, (byCategory.get(key) || 0) + 1); });
  const duplicateImages = approved.flatMap((listing) => listing.images.map((image) => ({ listingId: listing.id, imageUrl: image.imageUrl }))).reduce((duplicates, image, _, all) => { if (all.some((other) => other.imageUrl === image.imageUrl && other.listingId !== image.listingId)) duplicates.add(image.imageUrl); return duplicates; }, new Set());
  console.table(owners.map(({ id, email, _count }) => ({ id, email, listings: _count.listings })));
  console.log(JSON.stringify({ ownerCount: owners.length, approvedListings: approved.length, categoriesBelowSix: [...byCategory.entries()].filter(([, count]) => count < 6), listingsOutsideImageRange: approved.filter((listing) => listing.images.length < 3 || listing.images.length > 10).map((listing) => ({ id: listing.id, title: listing.title, images: listing.images.length })), duplicateImageUrls: [...duplicateImages] }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
