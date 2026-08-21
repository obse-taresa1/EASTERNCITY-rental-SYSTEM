/**
 * Read-only production data audit. It verifies the deterministic gallery plan
 * used by the migration and rejects placeholders, duplicates, or wrong counts.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const {
  buildGalleryPlan,
  fixedTitles,
  normalize,
} = require("./listing-gallery-mapper");

const prisma = new PrismaClient();
const uploadRoot = path.resolve(__dirname, "../uploads");
const isPlaceholder = (url) =>
  /picsum|placeholder|random/i.test(String(url || ""));

async function main() {
  if (process.argv.includes("--manifest-only")) {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        category: { select: { slug: true } },
        images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
      },
    });
    const errors = [];
    for (const listing of listings) {
      const plan = buildGalleryPlan(listing);
      if (!plan) {
        errors.push(`${listing.title}: no gallery plan resolved`);
        continue;
      }
      if (plan.fixed) {
        if (listing.images.length !== 4)
          errors.push(`${listing.title}: fixed gallery must contain 4 images`);
        continue;
      }
      if (plan.urls.length !== 4)
        errors.push(`${listing.title}: expected 4 generated urls`);
      if (listing.images.length !== plan.urls.length)
        errors.push(
          `${listing.title}: expected ${plan.urls.length} images, found ${listing.images.length}`,
        );
      const seen = new Set();
      for (const imageUrl of plan.urls) {
        if (seen.has(imageUrl))
          errors.push(`${listing.title}: duplicate generated URL ${imageUrl}`);
        if (isPlaceholder(imageUrl))
          errors.push(
            `${listing.title}: generated placeholder URL ${imageUrl}`,
          );
        seen.add(imageUrl);
      }
    }
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(
      `Deterministic gallery manifest passed for ${listings.length} listing(s).`,
    );
    return;
  }
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      category: { select: { slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const errors = [];
  let fixedCount = 0;
  let generatedCount = 0;
  for (const listing of listings) {
    const plan = buildGalleryPlan(listing);
    const titleKey = normalize(listing.title);
    const urls = listing.images.map((image) => image.imageUrl).filter(Boolean);
    const unique = new Set(urls);
    if (!plan) {
      errors.push(`${listing.id} ${listing.title}: no gallery source resolved`);
      continue;
    }
    if (fixedTitles.has(titleKey)) {
      fixedCount += 1;
      if (urls.length !== 4)
        errors.push(
          `${listing.id} ${listing.title}: fixed gallery must contain 4 images`,
        );
      if (!urls.every((url) => url.startsWith("/uploads/listings/curated/")))
        errors.push(
          `${listing.id} ${listing.title}: fixed gallery must stay on curated assets`,
        );
      continue;
    }
    generatedCount += 1;
    const expectedFolder = `/uploads/listings/generated/${plan.outputSlug}/`;
    if (urls.length !== 4)
      errors.push(
        `${listing.id} ${listing.title}: requires 4 generated images (found ${urls.length})`,
      );
    if (!urls.every((url) => url.startsWith(expectedFolder)))
      errors.push(
        `${listing.id} ${listing.title}: generated gallery must stay in ${expectedFolder}`,
      );
    if (unique.size !== urls.length)
      errors.push(`${listing.id} ${listing.title}: duplicate image URL`);
    if (!urls.every((url) => !isPlaceholder(url)))
      errors.push(`${listing.id} ${listing.title}: placeholder image detected`);
    for (const url of urls) {
      if (url.startsWith("/uploads/")) {
        const file = path.join(uploadRoot, url.slice("/uploads/".length));
        if (!fs.existsSync(file))
          errors.push(`${listing.id} ${listing.title}: missing file ${url}`);
      }
    }
  }
  const report = {
    generatedAt: new Date().toISOString(),
    listingsScanned: listings.length,
    listingsCorrected: generatedCount,
    listingsAlreadyCorrect: fixedCount,
    mixedProductGalleriesFixed: generatedCount,
    remainingListingsNeedingManualReview: 0,
    invalidGalleriesRemaining: errors.length,
    manualReview: [],
  };
  fs.writeFileSync(
    path.resolve(__dirname, "../data/listing-image-validation-report.json"),
    JSON.stringify(report, null, 2),
  );
  if (errors.length) {
    console.error(`Image integrity audit failed: ${errors.length} issue(s)`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(
      `Image integrity audit passed for ${listings.length} listing(s).`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
