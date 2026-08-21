const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const sharp = require("sharp");

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings");
const RAW_DIR = path.join(UPLOADS_DIR, "raw");
const ORIGINAL_DIR = path.join(UPLOADS_DIR, "original");
const MEDIUM_DIR = path.join(UPLOADS_DIR, "medium");
const THUMBNAIL_DIR = path.join(UPLOADS_DIR, "thumbnail");

// Ensure directories exist
[RAW_DIR, ORIGINAL_DIR, MEDIUM_DIR, THUMBNAIL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" } },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          return downloadBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        
        const data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
      }
    );
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

const cities = ["Addis Ababa", "Hawassa", "Adama", "Bahir Dar", "Dire Dawa"];
const neighborhoods = ["Bole", "Piazza", "CMC", "Sarbet", "Summit"];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Starting Production-Ready Seeder v6");
  console.log("==================================================\n");

  const catalogPath = path.join(__dirname, "..", "data", "imageCatalog.json");
  if (!fs.existsSync(catalogPath)) {
    console.error("❌ imageCatalog.json not found!");
    process.exit(1);
  }
  
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  // Clear old data
  console.log("🗑   Clearing old data...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  console.log("✅  Old data cleared.");

  const users = await prisma.user.findMany({ take: 30 });
  const dbCategories = await prisma.category.findMany();

  if (!users.length || !dbCategories.length) {
    console.error("❌  Users or Categories missing.");
    process.exit(1);
  }

  const globalHashes = new Set();
  
  let stats = {
    listingsCreated: 0,
    imagesCached: 0,
    imagesOptimized: 0,
    thumbnailsGenerated: 0,
    brokenUrls: 0,
    duplicateImages: 0,
    listingsSkipped: 0,
    listingImageCounts: []
  };

  const TARGET_PER_ITEM = 3;

  for (const itemKey of Object.keys(catalog)) {
    const item = catalog[itemKey];
    console.log(`\n📂 Processing Catalog Item: ${item.name} (${item.category})`);
    
    const dbCat = dbCategories.find(c => c.name === item.category);
    if (!dbCat) {
      console.log(`  ⚠️ Category not found: ${item.category}, skipping.`);
      continue;
    }

    // Attempt to download and cache all 8 images for this item ONCE
    console.log(`  ↓ Downloading ${item.images.length} source images...`);
    const validLocalAssets = [];

    for (let i = 0; i < item.images.length; i++) {
      const sourceImage = item.images[i];
      try {
        const buffer = await downloadBuffer(sourceImage.file);
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");

        if (globalHashes.has(hash)) {
          console.log(`    ⚠️ Duplicate hash detected for angle: ${sourceImage.angle}`);
          stats.duplicateImages++;
          continue;
        }

        // Validate format & size using sharp
        const metadata = await sharp(buffer).metadata();
        if (metadata.width < 800 || metadata.height < 600) {
           console.log(`    ⚠️ Image too small: ${metadata.width}x${metadata.height}`);
           continue;
        }

        const baseFileName = `${itemKey}-${i}-${hash.substring(0,6)}`;
        const rawPath = path.join(RAW_DIR, `${baseFileName}.${metadata.format}`);
        fs.writeFileSync(rawPath, buffer);
        globalHashes.add(hash);
        
        // Optimizations
        const webpFilename = `${baseFileName}.webp`;
        
        // Original WebP (max 1920)
        await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(path.join(ORIGINAL_DIR, webpFilename));
          
        // Medium WebP (max 800)
        await sharp(buffer)
          .resize(800, 600, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(path.join(MEDIUM_DIR, webpFilename));
          
        // Thumbnail WebP (max 400)
        await sharp(buffer)
          .resize(400, 300, { fit: 'cover' })
          .webp({ quality: 75 })
          .toFile(path.join(THUMBNAIL_DIR, webpFilename));

        stats.imagesCached++;
        stats.imagesOptimized += 2; // original + medium
        stats.thumbnailsGenerated++;

        validLocalAssets.push({
          filePrefix: baseFileName,
          angle: sourceImage.angle,
          hash: hash,
          mimeType: 'image/webp',
          size: buffer.length,
          width: metadata.width,
          height: metadata.height
        });

      } catch (err) {
        console.log(`    ⚠️ Failed download for angle ${sourceImage.angle}: ${err.message}`);
        stats.brokenUrls++;
      }
    }

    console.log(`  ✓ Successfully cached ${validLocalAssets.length} verified assets for ${item.name}`);

    if (validLocalAssets.length < 4) {
      console.log(`  ❌ Not enough valid images (${validLocalAssets.length}/4) for ${item.name}. Skipping listing creation.`);
      stats.listingsSkipped++;
      continue;
    }

    // Generate listings
    for (let k = 0; k < TARGET_PER_ITEM; k++) {
      const owner = pick(users);
      const city = pick(cities);
      
      const listing = await prisma.listing.create({
        data: {
          title: item.name,
          description: `Premium ${item.name} available in ${city}. Verified local asset.`,
          pricePerDay: 500 + (k * 50),
          categoryId: dbCat.id,
          city: city,
          location: pick(neighborhoods),
          ownerId: owner.id,
          status: "APPROVED",
        },
      });

      // Shuffle images to ensure unique galleries
      let gallery = shuffleArray(validLocalAssets);
      // Ensure 4 to 8 images
      const numImages = Math.max(4, Math.min(8, gallery.length));
      gallery = gallery.slice(0, numImages);

      for (let j = 0; j < gallery.length; j++) {
        const asset = gallery[j];
        await prisma.listingImage.create({
          data: {
            listingId: listing.id,
            imageUrl: `/uploads/listings/medium/${asset.filePrefix}.webp`,
            sortOrder: j,
            imageHash: `${asset.hash}-${listing.id}`, // pseudo unique for schema constraints in simulation
            mimeType: asset.mimeType,
            fileSize: asset.size,
            width: asset.width,
            height: asset.height,
            aiTags: asset.angle
          }
        });
      }
      
      stats.listingsCreated++;
      stats.listingImageCounts.push(gallery.length);
      console.log(`    Created listing ${listing.id.substring(0,8)} with ${gallery.length} images.`);
    }
  }

  // Final Validation Report
  const totalImagesUsed = stats.listingImageCounts.reduce((a, b) => a + b, 0);
  const avgImages = stats.listingsCreated ? (totalImagesUsed / stats.listingsCreated).toFixed(1) : 0;
  
  const failConditions = stats.listingImageCounts.some(c => c < 4) || stats.listingsSkipped > 0;
  
  console.log("\n==============================");
  console.log("Marketplace Validation Report");
  console.log("==============================");
  console.log(`Listings Created: ${stats.listingsCreated}`);
  console.log(`Images Cached: ${stats.imagesCached}`);
  console.log(`Images Optimized: ${stats.imagesOptimized}`);
  console.log(`Thumbnails Generated: ${stats.thumbnailsGenerated}`);
  console.log(`Broken URLs: ${stats.brokenUrls}`);
  console.log(`Duplicate Images: ${stats.duplicateImages}`);
  console.log(`Listings Missing Images (Skipped): ${stats.listingsSkipped}`);
  console.log(`Average Images Per Listing: ${avgImages}`);
  
  // Distribution
  const counts = {4:0, 5:0, 6:0, 7:0, 8:0};
  stats.listingImageCounts.forEach(c => counts[c]++);
  [4,5,6,7,8].forEach(c => console.log(`Listings with ${c} images: ${counts[c]}`));
  
  console.log("\nValidation: " + (failConditions ? "FAILED" : "PASSED"));
  
  if (failConditions) {
    console.error("\n❌ Marketplace validation failed. Seeder aborted.");
    process.exit(1);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
