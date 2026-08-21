const fs = require("fs/promises");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const [listingId, gallerySlug, ...queryParts] = process.argv.slice(2);
const query = queryParts.join(" ");

if (!listingId || !gallerySlug || !query) {
  throw new Error("Usage: node scripts/fetch-wikimedia-gallery.js <listing-id> <gallery-slug> <exact item query>");
}

const prisma = new PrismaClient();
const outputDirectory = path.join(__dirname, "..", "uploads", "listings", "representative", gallerySlug);
const sourceReportPath = path.join(__dirname, "..", "data", "representative-image-sources.json");
const wikimediaHeaders = { "User-Agent": "EasternCitiesMarketplace/1.0 (listing-gallery-maintenance)" };

function extensionFrom(contentType, sourceUrl) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  const urlExtension = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(urlExtension) ? urlExtension : ".jpg";
}

async function searchCommons() {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "1600",
    format: "json",
    origin: "*",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: wikimediaHeaders });
  if (!response.ok) throw new Error(`Wikimedia search failed: ${response.status}`);
  const payload = await response.json();
  return Object.values(payload.query?.pages ?? {})
    .map((page) => ({ page, image: page.imageinfo?.[0] }))
    .filter(({ image }) => image?.thumburl && /^image\/(jpeg|png|webp)$/.test(image.mime || ""));
}

async function main() {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error(`Listing ${listingId} was not found.`);

  const candidates = await searchCommons();
  if (candidates.length < 3) throw new Error(`Only ${candidates.length} Wikimedia images found for ${query}.`);

  const selected = candidates.slice(0, 4);
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.mkdir(path.dirname(sourceReportPath), { recursive: true });

  const saved = [];
  for (const [index, candidate] of selected.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 1200));
    const response = await fetch(candidate.image.thumburl, { headers: wikimediaHeaders });
    if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
    const extension = extensionFrom(response.headers.get("content-type"), candidate.image.thumburl);
    const filename = `${index + 1}${extension}`;
    await fs.writeFile(path.join(outputDirectory, filename), Buffer.from(await response.arrayBuffer()));
    saved.push({
      imageUrl: `/uploads/listings/representative/${gallerySlug}/${filename}`,
      sourceUrl: candidate.image.descriptionurl || candidate.image.thumburl,
      title: candidate.page.title,
      license: candidate.image.extmetadata?.LicenseShortName?.value || "Wikimedia Commons",
      sortOrder: index,
    });
  }

  await prisma.$transaction([
    prisma.listingImage.deleteMany({ where: { listingId } }),
    prisma.listingImage.createMany({ data: saved.map(({ imageUrl, sortOrder }) => ({ listingId, imageUrl, sortOrder })) }),
  ]);

  let report = {};
  try { report = JSON.parse(await fs.readFile(sourceReportPath, "utf8")); } catch { /* first source record */ }
  report[listingId] = { title: listing.title, categoryId: listing.categoryId, source: "Wikimedia Commons", images: saved };
  await fs.writeFile(sourceReportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Updated ${listing.title} with ${saved.length} Wikimedia Commons images.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
