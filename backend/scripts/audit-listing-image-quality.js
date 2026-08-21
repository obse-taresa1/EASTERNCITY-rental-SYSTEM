const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const projectRoot = path.resolve(__dirname, "..");
const dumpPath = path.join(projectRoot, "listings_dump.json");
const outputPath = path.join(projectRoot, "listing-image-quality-report.json");
const minimumWidth = 1000;
const minimumHeight = 700;

function localUploadPath(imageUrl) {
  if (!String(imageUrl).startsWith("/uploads/")) return null;
  return path.join(projectRoot, imageUrl.replace(/^\/uploads\//, "uploads/"));
}

async function inspectImage(image) {
  const filePath = localUploadPath(image.imageUrl);
  if (!filePath) return { url: image.imageUrl, issue: "REMOTE_SOURCE" };

  try {
    const [metadata, stats] = await Promise.all([sharp(filePath).metadata(), fs.stat(filePath)]);
    const lowResolution = !metadata.width || !metadata.height
      || metadata.width < minimumWidth
      || metadata.height < minimumHeight;
    return {
      url: image.imageUrl,
      filePath,
      width: metadata.width || 0,
      height: metadata.height || 0,
      bytes: stats.size,
      issue: lowResolution ? "LOW_RESOLUTION" : null,
    };
  } catch (error) {
    return { url: image.imageUrl, filePath, issue: "MISSING_OR_INVALID", error: error.message };
  }
}

async function main() {
  const listings = JSON.parse(await fs.readFile(dumpPath, "utf8"));
  const report = [];

  for (const listing of listings) {
    const images = await Promise.all((listing.images || []).map(inspectImage));
    const issues = images.filter((image) => image.issue);
    if (issues.length) {
      report.push({
        id: listing.id,
        title: listing.title,
        category: listing.category?.name || "Uncategorized",
        images,
      });
    }
  }

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  const issueCount = report.reduce((count, listing) => count + listing.images.filter((image) => image.issue).length, 0);
  console.log(`Scanned ${listings.length} listings. Flagged ${report.length} listings and ${issueCount} image records.`);
  console.log(`Report: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
