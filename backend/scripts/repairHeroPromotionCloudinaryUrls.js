/*
 * Repairs legacy HeroPromotion image paths after the local-upload to Cloudinary migration.
 *
 * Preview:
 *   node scripts/repairHeroPromotionCloudinaryUrls.js
 * Apply:
 *   node scripts/repairHeroPromotionCloudinaryUrls.js --execute
 */
require("dotenv").config();

const prisma = require("../src/config/db");

const execute = process.argv.includes("--execute");
const isLegacyUpload = (url) => String(url || "").startsWith("/uploads/");

async function main() {
  const promotions = await prisma.heroPromotion.findMany({
    where: {
      OR: [
        { heroImage: { startsWith: "/uploads/" } },
        { cardImage: { startsWith: "/uploads/" } },
      ],
    },
  });

  let repaired = 0;
  let skipped = 0;

  for (const promotion of promotions) {
    const listing = promotion.listingId
      ? await prisma.listing.findUnique({
        where: { id: promotion.listingId },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      })
      : null;
    const replacementUrl = listing?.images?.[0]?.imageUrl;
    if (!replacementUrl || isLegacyUpload(replacementUrl)) {
      skipped += 1;
      console.warn(`Skipped ${promotion.id}: no Cloudinary listing image is available.`);
      continue;
    }

    const data = {
      ...(isLegacyUpload(promotion.heroImage) ? { heroImage: replacementUrl } : {}),
      ...(isLegacyUpload(promotion.cardImage) ? { cardImage: replacementUrl } : {}),
    };

    console.log(`${execute ? "Repairing" : "Would repair"} ${promotion.id} (${promotion.title})`);
    if (execute) await prisma.heroPromotion.update({ where: { id: promotion.id }, data });
    repaired += 1;
  }

  console.log(`${execute ? "Repair complete" : "Preview complete"}: ${repaired} repaired, ${skipped} skipped.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
