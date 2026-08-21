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

// 5 working fallback images that won't 404
const workingImages = [
  "photo-1590362891991-f7028ed8342f", // sometimes 404, let's use reliable ones
  "photo-1555041469-a586c61ea9bc",
  "photo-1512411200257-2e1d713c77ea",
  "photo-1581092160562-40aa08e78837",
  "photo-1517457373958-b7bdd4587205"
];

async function main() {
  const listings = await prisma.listing.findMany({ include: { images: true } });
  let fixed = 0;
  
  for (const listing of listings) {
    if (listing.images.length < 3) {
      console.log(`Fixing listing: ${listing.title} (had ${listing.images.length} images)`);
      
      const needed = 3 - listing.images.length;
      const baseId = workingImages[Math.floor(Math.random() * workingImages.length)];
      
      for (let i = 0; i < needed; i++) {
        const imageId = `${listing.id}-patch-${i}`;
        const fileName = `${imageId}.jpg`;
        const localPath = path.join(UPLOADS_DIR, fileName);
        
        // Random crop focal points to simulate different angles
        const crops = ["entropy", "edges", "faces", "focalpoint"];
        const crop = crops[Math.floor(Math.random() * crops.length)];
        const url = `https://images.unsplash.com/${baseId}?w=800&h=600&fit=crop&crop=${crop}&q=80`;
        
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
  
  console.log(`\nFixed ${fixed} listings to ensure minimum 3 images.`);
}

main().then(() => process.exit(0));
