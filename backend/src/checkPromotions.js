const prisma = require('./config/db');

async function run() {
  try {
    console.log("=== ALL PROMOTIONS ===");
    const promotions = await prisma.promotion.findMany({
      include: {
        listing: {
          include: {
            images: true,
            owner: true
          }
        }
      }
    });
    console.log(JSON.stringify(promotions, null, 2));

    console.log("=== ALL LISTINGS ===");
    const listings = await prisma.listing.findMany({
      include: {
        images: true
      }
    });
    console.log(JSON.stringify(listings, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
