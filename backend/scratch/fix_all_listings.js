const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings", "fixed");

const wikimediaHeaders = { "User-Agent": "EasternCitiesMarketplace/1.0 (listing-gallery-maintenance)" };

function cleanQuery(title) {
  let q = title.toLowerCase();
  q = q.replace(/ (500 pax|kit|set|professional|heavy duty|portable|modern|premium|luxury|industrial|commercial|adjustable)\b/gi, '');
  q = q.replace(/^(heavy duty|portable|modern|premium|luxury|industrial|commercial|adjustable)\s+/gi, '');
  return q.trim();
}

async function searchCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "3",
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "800",
    format: "json",
    origin: "*",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: wikimediaHeaders });
  if (!response.ok) return null;
  const payload = await response.json();
  const pages = Object.values(payload.query?.pages ?? {});
  const images = pages
    .map((page) => ({ page, image: page.imageinfo?.[0] }))
    .filter(({ image }) => image?.thumburl && /^image\/(jpeg|png|webp)$/.test(image.mime || ""));
  return images.length > 0 ? images[0] : null;
}

function extensionFrom(contentType, sourceUrl) {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  const urlExtension = path.extname(new URL(sourceUrl).pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(urlExtension) ? urlExtension : ".jpg";
}

async function main() {
  await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
  const listings = await prisma.listing.findMany();
  
  // Group by title so we don't fetch the same image multiple times for same titles
  const titles = [...new Set(listings.map(l => l.title))];
  const titleToImage = {};

  console.log(`Found ${titles.length} unique titles. Fetching images...`);

  for (const title of titles) {
    let query = cleanQuery(title);
    // Hardcode some difficult ones based on user examples
    if (title.includes("Generator")) query = "Portable generator";
    if (title.includes("Bed")) query = "Bed furniture";
    if (title.includes("Canon DSLR") || title.includes("Canon EOS")) query = "Canon DSLR";
    if (title.includes("Office Chair")) query = "Office chair";
    if (title.includes("Wedding Tent")) query = "Marquee tent";
    if (title.includes("Concrete Mixer")) query = "Concrete mixer";
    
    let candidate = await searchCommons(query);
    if (!candidate && query.split(' ').length > 1) {
        // fallback
        candidate = await searchCommons(query.split(' ')[0]);
    }

    if (candidate) {
      console.log(`[OK] ${title} -> ${query} -> ${candidate.page.title}`);
      
      const response = await fetch(candidate.image.thumburl, { headers: wikimediaHeaders });
      if (response.ok) {
        const extension = extensionFrom(response.headers.get("content-type"), candidate.image.thumburl);
        const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
        const localPath = path.join(UPLOADS_DIR, filename);
        
        await fs.promises.writeFile(localPath, Buffer.from(await response.arrayBuffer()));
        
        titleToImage[title] = `/uploads/listings/fixed/${filename}`;
      } else {
        console.log(`[ERR] Failed to download for ${title}`);
      }
    } else {
      console.log(`[ERR] No image found for ${title} (query: ${query})`);
    }
    await new Promise(r => setTimeout(r, 500)); // rate limit
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
