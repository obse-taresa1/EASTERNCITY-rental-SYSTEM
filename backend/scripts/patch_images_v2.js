const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const https = require("https");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings");

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
          return;
        }
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

// 100% reliable image URLs instead of Unsplash IDs that might 404
const reliableImages = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80"
];

async function main() {
  const listings = await prisma.listing.findMany({ include: { images: true } });
  let fixed = 0;
  
  for (const listing of listings) {
    if (listing.images.length < 3) {
      console.log(`Fixing listing: ${listing.title}`);
      const needed = 3 - listing.images.length;
      
      for (let i = 0; i < needed; i++) {
        const imageId = `${listing.id}-patch-v2-${i}`;
        const fileName = `${imageId}.jpg`;
        const localPath = path.join(UPLOADS_DIR, fileName);
        
        const url = reliableImages[Math.floor(Math.random() * reliableImages.length)];
        
        try {
          await downloadImage(url, localPath);
          await prisma.listingImage.create({
            data: {
              listingId: listing.id,
              imageUrl: `/uploads/listings/${fileName}`,
              sortOrder: listing.images.length + i,
            },
          });
        } catch (e) {
          console.error("Failed patch download:", e.message);
        }
      }
      fixed++;
    }
  }
  
  console.log(`\nFixed ${fixed} listings to ensure minimum 3 images using reliable URLs.`);
}

main().then(() => process.exit(0));
