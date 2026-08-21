const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings", "fixed_ai");

function cleanQuery(title) {
  let q = title.replace(/ (500 pax|kit|set)\b/gi, '');
  return q.trim();
}

async function main() {
  await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
  const listings = await prisma.listing.findMany();
  
  const titles = [...new Set(listings.map(l => l.title))];
  const titleToImage = {};

  console.log(`Found ${titles.length} unique titles. Fetching images...`);

  for (const title of titles) {
    let query = cleanQuery(title) + " product photography on white background";
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=800&height=600&nologo=true`;
    
    console.log(`Fetching: ${title}`);
    
    try {
        const response = await fetch(url);
        if (response.ok) {
            const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
            const localPath = path.join(UPLOADS_DIR, filename);
            
            await fs.promises.writeFile(localPath, Buffer.from(await response.arrayBuffer()));
            titleToImage[title] = `/uploads/listings/fixed_ai/${filename}`;
        } else {
            console.log(`[ERR] Failed to download for ${title}`);
        }
    } catch(err) {
        console.error(`[ERR] fetch failed for ${title}`, err);
    }
  }

  console.log('Updating database...');
  for (const listing of listings) {
    const imageUrl = titleToImage[listing.title];
    if (imageUrl) {
      await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          imageUrl: imageUrl,
          sortOrder: 0
        }
      });
    }
  }

  console.log('Done fixing images!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
