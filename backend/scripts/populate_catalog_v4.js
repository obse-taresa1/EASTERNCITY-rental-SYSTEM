const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const https = require("https");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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

// 1. Real Rental Asset Catalog
// Curated 2-3 items per category with their own unique gallery of 4 images.
const inventory = [
  {
    title: "Toyota Corolla 2018",
    categorySlug: "cars-and-vehicles",
    price: 2500,
    images: [
      "https://images.unsplash.com/photo-1590362891991-f7028ed8342f?w=800&q=80", // front
      "https://images.unsplash.com/photo-1555353540-64fd365440b7?w=800&q=80", // side
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", // interior
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"  // dashboard
    ]
  },
  {
    title: "Toyota Hilux Double Cab",
    categorySlug: "cars-and-vehicles",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1625049383921-689366e8cb49?w=800&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      "https://images.unsplash.com/photo-1503376713356-2a7b1b3ed9f5?w=800&q=80"
    ]
  },
  {
    title: "Hyundai Tucson SUV",
    categorySlug: "cars-and-vehicles",
    price: 3000,
    images: [
      "https://images.unsplash.com/photo-1633506161491-1cb833c8bfbe?w=800&q=80",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80"
    ]
  },
  {
    title: "Canon EOS 90D DSLR",
    categorySlug: "electronics-and-cameras",
    price: 800,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80", // front
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80", // lens
      "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=800&q=80", // side
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&q=80"  // in use
    ]
  },
  {
    title: "Sony A7 III Mirrorless",
    categorySlug: "electronics-and-cameras",
    price: 1200,
    images: [
      "https://images.unsplash.com/photo-1617005082833-1e0e8432a1eb?w=800&q=80",
      "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=800&q=80",
      "https://images.unsplash.com/photo-1519965005953-6252994943f5?w=800&q=80",
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80"
    ]
  },
  {
    title: "GoPro Hero 10 Black",
    categorySlug: "electronics-and-cameras",
    price: 400,
    images: [
      "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&q=80",
      "https://images.unsplash.com/photo-1502920514313-ceea98b470d8?w=800&q=80",
      "https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=800&q=80",
      "https://images.unsplash.com/photo-1544002685-613d9691fbcc?w=800&q=80"
    ]
  },
  {
    title: "Wedding Tent 500 Pax",
    categorySlug: "party-and-wedding",
    price: 8000,
    images: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80", // exterior
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", // interior
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", // details
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80"  // night
    ]
  },
  {
    title: "Professional Sound System",
    categorySlug: "party-and-wedding",
    price: 3000,
    images: [
      "https://images.unsplash.com/photo-1520110120835-c96534a4c984?w=800&q=80",
      "https://images.unsplash.com/photo-1516280440502-65f65a129d2b?w=800&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c090be5f523?w=800&q=80"
    ]
  },
  {
    title: "Banquet Chairs (Set of 50)",
    categorySlug: "party-and-wedding",
    price: 1000,
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d32170b4?w=800&q=80",
      "https://images.unsplash.com/photo-1505362947113-d49d949dd2e0?w=800&q=80"
    ]
  },
  {
    title: "Heavy Duty Concrete Mixer",
    categorySlug: "construction-and-tools",
    price: 1500,
    images: [
      "https://images.unsplash.com/photo-1541888087618-f2b1c6c64601?w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356f90?w=800&q=80",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
      "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800&q=80"
    ]
  },
  {
    title: "Steel Scaffolding Set",
    categorySlug: "construction-and-tools",
    price: 800,
    images: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
      "https://images.unsplash.com/photo-1541888087618-f2b1c6c64601?w=800&q=80",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
      "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800&q=80"
    ]
  },
  {
    title: "Sony PlayStation 5",
    categorySlug: "gaming-and-vr",
    price: 400,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80",
      "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800&q=80",
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80"
    ]
  },
  {
    title: "Meta Quest 3 VR",
    categorySlug: "gaming-and-vr",
    price: 600,
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
      "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80",
      "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80",
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80"
    ]
  },
  {
    title: "Mountain Bike Trek",
    categorySlug: "sports-and-fitness",
    price: 500,
    images: [
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"
    ]
  },
  {
    title: "Commercial Treadmill",
    categorySlug: "sports-and-fitness",
    price: 1500,
    images: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
    ]
  },
  {
    title: "8-Person Family Tent",
    categorySlug: "camping-and-outdoor",
    price: 450,
    images: [
      "https://images.unsplash.com/photo-1504280390227-36154e5b38bd?w=800&q=80",
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
      "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80"
    ]
  }
  // This is a representative sample. 
  // In a full production script, you'd have 2-3 per category for all 13 categories.
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80"
];

const cities = ["Addis Ababa", "Dire Dawa", "Hawassa", "Adama", "Mekelle", "Bahir Dar"];
const locations = ["Bole", "Piazza", "Kera", "Summit", "Megenagna", "Sarbet"];

async function main() {
  console.log("Starting static catalog seeding script...");
  
  // 1. Clear old listings
  console.log("Clearing existing listings...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  console.log("Cleared.");

  // 2. Fetch users and categories
  const users = await prisma.user.findMany({ take: 20 });
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  if (!users.length || !categories.length) {
    console.error("Missing users or categories in DB. Run base seeders first.");
    return;
  }

  // 3. Generate 6 listings per category
  let listingCount = 0;
  
  for (const category of categories) {
    // Find catalog items for this category, or just use a generic one if missing
    let availableItems = inventory.filter(i => i.categorySlug === category.slug);
    
    // If we didn't define specific items for this category in the array above, just use fallback
    if (availableItems.length === 0) {
      availableItems = [{
        title: `Premium ${category.name} Item`,
        categorySlug: category.slug,
        price: 500,
        images: fallbackImages
      }];
    }

    // We need 6 listings per category
    for (let i = 0; i < 6; i++) {
      // Pick an item from available catalog items sequentially (looping if necessary)
      const catalogItem = availableItems[i % availableItems.length];
      
      const owner = users[Math.floor(Math.random() * users.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      console.log(`Creating listing: ${catalogItem.title} in ${city} (Owner: ${owner.firstName})`);
      
      const listing = await prisma.listing.create({
        data: {
          title: catalogItem.title,
          description: `Excellent condition ${catalogItem.title} available for rent in ${city}. High quality and well maintained.`,
          pricePerDay: catalogItem.price + (Math.floor(Math.random() * 5) * 100), // slight price variation
          categoryId: category.id,
          city: city,
          location: location,
          ownerId: owner.id,
          status: "APPROVED",
        }
      });
      
      // Download and attach images for this listing
      for (let j = 0; j < catalogItem.images.length; j++) {
        const url = catalogItem.images[j];
        const fileName = `${listing.id}-img-${j}.jpg`;
        const localPath = path.join(UPLOADS_DIR, fileName);
        
        try {
          await downloadImage(url, localPath);
          await prisma.listingImage.create({
            data: {
              listingId: listing.id,
              imageUrl: `/uploads/listings/${fileName}`,
              sortOrder: j
            }
          });
        } catch (e) {
          console.error(`Failed to download image ${j} for ${catalogItem.title}: ${e.message}`);
          // Fallback to avoid empty galleries
          try {
             await downloadImage(fallbackImages[j], localPath);
             await prisma.listingImage.create({
              data: {
                listingId: listing.id,
                imageUrl: `/uploads/listings/${fileName}`,
                sortOrder: j
              }
            });
          } catch(e2) {}
        }
      }
      listingCount++;
    }
  }

  console.log(`\n🎉 Success! Created ${listingCount} listings with curated multi-angle static galleries.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
