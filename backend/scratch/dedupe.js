const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dedupeListings() {
  console.log('Fetching all listings...');
  const listings = await prisma.listing.findMany({
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'asc' // Keep the oldest ones
    }
  });

  console.log(`Found ${listings.length} total listings.`);

  const seenTitles = new Set();
  const seenImages = new Set();
  const toDelete = [];
  const toKeep = [];

  for (const listing of listings) {
    const title = listing.title.trim().toLowerCase();
    const image = listing.images && listing.images.length > 0 ? listing.images[0].imageUrl : null;

    let isDuplicate = false;

    if (seenTitles.has(title)) {
      isDuplicate = true;
      console.log(`Duplicate Title found: ${listing.title}`);
    } else if (image && seenImages.has(image)) {
      isDuplicate = true;
      console.log(`Duplicate Image found: ${listing.title} (shares image with another)`);
    }

    if (isDuplicate) {
      toDelete.push(listing.id);
    } else {
      seenTitles.add(title);
      if (image) seenImages.add(image);
      toKeep.push(listing);
    }
  }

  console.log(`\nWill keep: ${toKeep.length} unique listings.`);
  console.log(`Will delete: ${toDelete.length} duplicate listings.\n`);

  for (const id of toDelete) {
    try {
      // Cascade delete related records manually
      await prisma.listingImage.deleteMany({ where: { listingId: id } });
      await prisma.promotion.deleteMany({ where: { listingId: id } });
      await prisma.review.deleteMany({ where: { listingId: id } });
      await prisma.booking.deleteMany({ where: { listingId: id } });
      
      const convos = await prisma.conversation.findMany({ where: { listingId: id } });
      for (const c of convos) {
        await prisma.message.deleteMany({ where: { conversationId: c.id } });
        await prisma.conversation.delete({ where: { id: c.id } });
      }

      await prisma.listing.delete({ where: { id: id } });
      process.stdout.write('.');
    } catch (error) {
      console.error(`\nFailed to delete listing ${id}:`, error.message);
    }
  }

  console.log('\n\nDeduplication complete!');
  await prisma.$disconnect();
}

dedupeListings().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
