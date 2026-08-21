/**
 * Applies deterministic product galleries to every listing that is not part of
 * the preserved fixed set. It uses exact curated galleries first and then falls
 * back to title/category matching so every listing gets 3-4 realistic images.
 * Run without --apply first to review the planned changes.
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");
const {
  buildGalleryPlan,
  fixedTitles,
  normalize,
} = require("./listing-gallery-mapper");
const prisma = new PrismaClient();
const shouldApply = process.argv.includes("--apply");

const uploadsRoot = path.resolve(__dirname, "..", "uploads", "listings");
const generatedRoot = path.join(uploadsRoot, "generated");

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      (response) => {
        if (
          [301, 302, 307, 308].includes(response.statusCode) &&
          response.headers.location
        ) {
          resolve(downloadBuffer(response.headers.location));
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );
    request.on("error", reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function getSourceBuffer(sourceUrl) {
  if (!sourceUrl) throw new Error("Missing source URL for gallery generation");
  if (sourceUrl.startsWith("/uploads/")) {
    const filePath = path.join(
      uploadsRoot,
      sourceUrl.slice("/uploads/".length),
    );
    return fs.promises.readFile(filePath);
  }
  if (sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://")) {
    return downloadBuffer(sourceUrl);
  }
  return fs.promises.readFile(sourceUrl);
}

async function buildLocalGallery(plan, listing) {
  const sourceBuffer = await getSourceBuffer(plan.sourceUrl);
  const gallerySlug = plan.outputSlug || normalize(listing.title || listing.id);
  const galleryDir = path.join(generatedRoot, gallerySlug);
  await fs.promises.mkdir(galleryDir, { recursive: true });

  const transforms = [
    {
      suffix: "front",
      position: "entropy",
      rotate: 0,
      width: 800,
      height: 600,
    },
    { suffix: "side", position: "west", rotate: -1, width: 800, height: 600 },
    { suffix: "rear", position: "east", rotate: 1, width: 800, height: 600 },
    { suffix: "detail", position: "top", rotate: 0, width: 700, height: 525 },
  ];

  const created = [];
  for (let index = 0; index < transforms.length; index += 1) {
    const transform = transforms[index];
    const fileName = `${gallerySlug}-${index}-${transform.suffix}.webp`;
    const outputPath = path.join(galleryDir, fileName);
    await sharp(sourceBuffer)
      .rotate(transform.rotate)
      .resize(transform.width, transform.height, {
        fit: "cover",
        position: transform.position,
        withoutEnlargement: true, // Prevent blurriness by not upscaling small sources
      })
      .webp({ quality: 75 })
      .toFile(outputPath);
    created.push({
      listingId: listing.id,
      imageUrl: `/uploads/listings/generated/${gallerySlug}/${fileName}`,
      sortOrder: index,
    });
  }

  return created;
}

async function main() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      category: { select: { slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { imageUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const candidates = [];
  const skipped = [];
  const alreadyCorrect = [];
  for (const listing of listings) {
    const titleKey = normalize(listing.title);
    const plan = buildGalleryPlan(listing);
    if (!plan) {
      skipped.push(`${listing.title}: no gallery source resolved`);
      continue;
    }

    const current = listing.images.map((image) => image.imageUrl);
    if (plan.fixed) {
      const expected = plan.urls;
      if (
        current.length === expected.length &&
        current.every((url, index) => url === expected[index])
      ) {
        skipped.push(`${listing.title}: preserved fixed gallery`);
        alreadyCorrect.push(listing);
        continue;
      }
      candidates.push({ listing, plan });
      continue;
    }

    // Removed the alreadyCorrect skip block to force regeneration of all images

    candidates.push({ listing, plan });
  }
  candidates.forEach(({ listing }) =>
    console.log(
      `${shouldApply ? "Applying" : "Would apply"} curated gallery: ${listing.title} (${listing.id})`,
    ),
  );
  skipped.forEach((message) => console.log(`Skipped: ${message}`));
  const report = {
    generatedAt: new Date().toISOString(),
    totalListingsScanned: listings.length,
    listingsUpdated: candidates.length,
    listingsAlreadyCorrect: alreadyCorrect.length,
    listingsSkippedForManualReview: skipped.length,
    skipped,
    imagesReplaced: shouldApply
      ? candidates.reduce((total, item) => total + item.plan.urls.length, 0)
      : 0,
  };
  fs.writeFileSync(
    path.resolve(__dirname, "../data/listing-image-migration-report.json"),
    JSON.stringify(report, null, 2),
  );
  if (!shouldApply) {
    console.log(
      `Preview report written: backend/data/listing-image-migration-report.json`,
    );
    return;
  }
  for (const { listing, plan } of candidates) {
    const imageData = plan.fixed
      ? plan.urls.map((imageUrl, sortOrder) => ({
          listingId: listing.id,
          imageUrl,
          sortOrder,
        }))
      : await buildLocalGallery(plan, listing);
    await prisma.$transaction([
      prisma.listingImage.deleteMany({ where: { listingId: listing.id } }),
      prisma.listingImage.createMany({ data: imageData }),
    ]);
  }
  console.log(`Applied ${candidates.length} curated gallery update(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
