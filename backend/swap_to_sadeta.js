require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const now = new Date();

  // Show all active featured promotions
  const active = await prisma.promotion.findMany({
    where: {
      status: "APPROVED",
      placement: { in: ["Featured Listing", "FEATURED", "FEATURED_LISTING"] },
      startDate: { lte: now },
      endDate: { gte: now }
    },
    include: { listing: { select: { title: true, id: true } } }
  });

  console.log("Active featured promotions:");
  active.forEach(p => console.log(`  ID: ${p.id} | ${p.listing?.title} (${p.listingId})`));

  // Find Sadeta Harage Dress
  const sadeta = await prisma.listing.findFirst({
    where: { title: { contains: "Sadeta", mode: "insensitive" } }
  });
  console.log("Sadeta listing:", sadeta?.id, sadeta?.title);

  // Find Toyota RAV4 promotion
  const toyotaPromo = active.find(p => p.listing?.title?.toLowerCase().includes("rav4"));
  if (!toyotaPromo) {
    console.log("Toyota RAV4 promotion not found. Showing all titles above.");
    return;
  }
  if (!sadeta) {
    console.log("Sadeta Harage Dress not found in DB!");
    return;
  }

  // Swap the listingId on that promotion to point to Sadeta
  await prisma.promotion.update({
    where: { id: toyotaPromo.id },
    data: { listingId: sadeta.id }
  });
  console.log("Swapped Toyota RAV4 -> Sadeta Harage Dress in promotion", toyotaPromo.id);
}
run().catch(console.error).finally(() => prisma.$disconnect());
