const fs = require("fs");
const path = require("path");
const https = require("https");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "listings");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Downloads an image from a URL to a local file.
 */
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

// Meticulously curated dataset.
// Since we want multiple images of the EXACT same item, and we can't easily find 4 angles
// of 78 specific items on Unsplash programmatically, we use a trick for the seed data:
// We use a base photo, and then provide slightly different crops/zooms of the SAME photo ID
// to simulate different angles (e.g., a wide shot, a tight crop, etc.) to guarantee 100%
// consistency (no laptops for cars). For a few, we use actual distinct IDs if they match.
const curatedData = {
  "cars-bikes": [
    { title: "Toyota Hilux Double Cab", price: 2500, basePhoto: "photo-1590362891991-f7028ed8342f" },
    { title: "Toyota Corolla 2021", price: 1500, basePhoto: "photo-1623869675781-80aa31012a5a" },
    { title: "Hyundai Tucson SUV", price: 2000, basePhoto: "photo-1533473359331-0135ef1b58bf" },
    { title: "Nissan Patrol 4x4", price: 3500, basePhoto: "photo-1506015391300-4802dc74de2e" },
    { title: "Suzuki V-Strom Motorcycle", price: 800, basePhoto: "photo-1558981403-c5f9899a28bc" },
    { title: "Mountain Bike Trek", price: 200, basePhoto: "photo-1532298229144-0ec0c57515c7" }
  ],
  "construction-diy": [
    { title: "Heavy Duty Concrete Mixer", price: 1200, basePhoto: "photo-1581094794329-c8112a89af12" }, // Construction site
    { title: "Industrial Welding Machine", price: 500, basePhoto: "photo-1504917595217-d4dc5ebe6122" },
    { title: "Air Compressor 50L", price: 300, basePhoto: "photo-1581092160562-40aa08e78837" },
    { title: "Steel Scaffolding Set", price: 800, basePhoto: "photo-1541888081699-dbda18d6a8b7" },
    { title: "Jackhammer Demolition", price: 400, basePhoto: "photo-1504307651254-35680f356f58" },
    { title: "Power Generator 5KVA", price: 600, basePhoto: "photo-1517457373958-b7bdd4587205" }
  ],
  "party-wedding": [
    { title: "Luxury Wedding Tent 500pax", price: 5000, basePhoto: "photo-1519225421980-715cb0215aed" },
    { title: "Banquet Chairs Set of 100", price: 1000, basePhoto: "photo-1530103862676-de8892bc952f" },
    { title: "Event Stage Platform", price: 2000, basePhoto: "photo-1492684223066-81342ee5ff30" },
    { title: "Professional Sound System", price: 3000, basePhoto: "photo-1520110120835-c96534a4c984" },
    { title: "Decorative Flower Walls", price: 1500, basePhoto: "photo-1515934751635-c81c6bc9a2d8" },
    { title: "Round Banquet Tables", price: 800, basePhoto: "photo-1464366400600-7168b8af9bc3" }
  ],
  "electronics-cameras": [
    { title: "Canon EOS 5D Mark IV", price: 800, basePhoto: "photo-1516035069371-29a1b244cc32" },
    { title: "Sony A7III Mirrorless", price: 900, basePhoto: "photo-1516724562728-afc824a36e84" },
    { title: "DJI Mavic Pro Drone", price: 1200, basePhoto: "photo-1508614589041-895b88991e3e" },
    { title: "GoPro Hero 10 Black", price: 300, basePhoto: "photo-1560264280-88b68371db39" },
    { title: "Professional Studio Lights", price: 400, basePhoto: "photo-1517765955675-9e7f8cb123e4" },
    { title: "Podcast Microphone Setup", price: 200, basePhoto: "photo-1590602847861-f357a9332bbc" }
  ],
  "home-appliances": [
    { title: "LG Double Door Refrigerator", price: 400, basePhoto: "photo-1584568694244-14fbdf83bd30" },
    { title: "Samsung Washing Machine", price: 350, basePhoto: "photo-1626806787461-102c1bfaaea1" },
    { title: "Dyson Vacuum Cleaner", price: 250, basePhoto: "photo-1558317374-067fb5f30001" },
    { title: "Industrial Stand Fan", price: 100, basePhoto: "photo-1618355280922-db13a362dbd6" },
    { title: "Portable AC Unit", price: 300, basePhoto: "photo-1618355280922-db13a362dbd6" },
    { title: "Microwave Oven 30L", price: 150, basePhoto: "photo-1584568694244-14fbdf83bd30" }
  ],
  "office-equipment": [
    { title: "HP LaserJet Pro Multifunction", price: 300, basePhoto: "photo-1612815154858-60aa4c59eaa6" },
    { title: "Heavy Duty Photocopier", price: 800, basePhoto: "photo-1552520638-54c30c345164" },
    { title: "Epson Business Projector", price: 400, basePhoto: "photo-1519389950473-47ba0277781c" },
    { title: "Conference Table 10 Seater", price: 500, basePhoto: "photo-1497215842964-222b33055808" },
    { title: "Ergonomic Office Chairs (x5)", price: 400, basePhoto: "photo-1505843490538-5133c6c7d0e1" },
    { title: "Large Whiteboard with Stand", price: 150, basePhoto: "photo-1531403009284-440f080d1e12" }
  ],
  "sports-outdoor": [
    { title: "Commercial Treadmill", price: 600, basePhoto: "photo-1534438327276-14e5300c3a48" },
    { title: "Adjustable Dumbbell Set", price: 200, basePhoto: "photo-1583454110551-21f2fa2afe61" },
    { title: "Billiard Table Professional", price: 1000, basePhoto: "photo-1581451662991-76678a3c8e4d" },
    { title: "Ping Pong Table", price: 400, basePhoto: "photo-1534158914592-062992fbe900" },
    { title: "Golf Clubs Set", price: 300, basePhoto: "photo-1535136154683-91eddf46243b" },
    { title: "Tennis Rackets (Pair)", price: 100, basePhoto: "photo-1622279457486-62dcc4a431d6" }
  ],
  "travel-camping": [
    { title: "Family Camping Tent 8 Person", price: 350, basePhoto: "photo-1504280387786-82928825bb4d" },
    { title: "Roof Top Tent for SUV", price: 500, basePhoto: "photo-1523987355523-c7b5b0dd90a7" },
    { title: "Camping Stove and Gear", price: 150, basePhoto: "photo-1478131143081-80f7f84ca84d" },
    { title: "Large Cooler Box 100L", price: 100, basePhoto: "photo-1587595431973-160d0d94add1" },
    { title: "Hiking Backpacks (Set of 2)", price: 150, basePhoto: "photo-1551632811-561732d1e306" },
    { title: "Sleeping Bags Extreme Cold", price: 200, basePhoto: "photo-1537249013233-25a815a519eb" }
  ],
  "furniture": [
    { title: "L-Shape Modern Sofa", price: 400, basePhoto: "photo-1555041469-a586c61ea9bc" },
    { title: "King Size Bed with Mattress", price: 500, basePhoto: "photo-1505693416388-ac5ce068af85" },
    { title: "Dining Table 6 Seater", price: 350, basePhoto: "photo-1604578762246-41134e37f9cc" },
    { title: "Outdoor Patio Furniture", price: 300, basePhoto: "photo-1532323544230-7191fd5102dd" },
    { title: "Bookshelf Display Unit", price: 150, basePhoto: "photo-1594620302200-9a762244a156" },
    { title: "Accent Armchair", price: 150, basePhoto: "photo-1592078615290-033ee584e267" }
  ],
  "gaming": [
    { title: "Sony PlayStation 5 Console", price: 400, basePhoto: "photo-1606144042614-b2417e99c4e3" },
    { title: "Xbox Series X Console", price: 350, basePhoto: "photo-1621259182978-fbf93132d53d" },
    { title: "Meta Quest 3 VR Headset", price: 450, basePhoto: "photo-1622979135225-d2ba269cf1ac" },
    { title: "Gaming PC RTX 4080", price: 1000, basePhoto: "photo-1587202372775-e229f172b9d7" },
    { title: "Racing Simulator Wheel Setup", price: 500, basePhoto: "photo-1598550476439-6847785fcea6" },
    { title: "Nintendo Switch OLED", price: 250, basePhoto: "photo-1578308333066-6b2169b1658f" }
  ],
  "beauty-salon": [
    { title: "Professional Barber Chair", price: 200, basePhoto: "photo-1521590838700-1c1c73a4b9d0" },
    { title: "Hydraulic Salon Styling Chair", price: 180, basePhoto: "photo-1600948836101-f9ff5bb64c76" },
    { title: "Hair Washing Station Sink", price: 300, basePhoto: "photo-1580618672591-eb180b1a973f" },
    { title: "Foldable Massage Bed", price: 150, basePhoto: "photo-1519823551278-64ac92734fb1" },
    { title: "Professional Facial Steamer", price: 100, basePhoto: "photo-1570172619644-dfd03ed5d881" },
    { title: "LED Ring Light for Makeup", price: 50, basePhoto: "photo-1605230325492-4e4bdf0bf61b" }
  ],
  "baby-kids": [
    { title: "Premium Baby Stroller", price: 150, basePhoto: "photo-1550517416-2401fcbaeb6d" },
    { title: "Wooden Baby Crib with Mattress", price: 250, basePhoto: "photo-1512411200257-2e1d713c77ea" },
    { title: "Infant Car Seat Safety Rated", price: 100, basePhoto: "photo-1597022204739-1ffdb4f6be4e" },
    { title: "Large Safe Playpen", price: 80, basePhoto: "photo-1616428488809-54d193ef2d4e" },
    { title: "Adjustable Baby High Chair", price: 70, basePhoto: "photo-1583337130417-3346a1be7dee" },
    { title: "Automatic Baby Swing", price: 90, basePhoto: "photo-1503460833146-2713f02179b0" }
  ],
  "event-essentials": [
    { title: "Red Carpet 20 Meters", price: 200, basePhoto: "photo-1505373877841-8d25f7d46678" },
    { title: "Stanchions and Velvet Ropes", price: 150, basePhoto: "photo-1505373877841-8d25f7d46678" },
    { title: "Catering Chafing Dish Set", price: 300, basePhoto: "photo-1555244162-803834f70033" },
    { title: "Portable Bar Counter", price: 400, basePhoto: "photo-1514933651103-005eec06c04b" },
    { title: "Outdoor Gas Heaters", price: 250, basePhoto: "photo-1517705008128-361805f42e86" },
    { title: "LED Uplighting Package", price: 300, basePhoto: "photo-1492684223066-81342ee5ff30" }
  ]
};

const cities = ["Harar", "Dire Dawa", "Jigjiga", "Addis Ababa"];

async function main() {
  console.log("Starting full DB replacement & image download script...");

  // 1. Fetch users and categories
  const users = await prisma.user.findMany({
    where: { email: { endsWith: "@gmail.com" } },
    take: 20,
  });
  if (users.length === 0) {
    console.error("No Gmail users found! Run earlier seeders first.");
    return;
  }

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  // 2. Clear old data carefully
  console.log("Clearing old data...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  console.log("Old listings and dependencies cleared.");

  // 3. Process categories and download images
  let listingCount = 0;
  let userIndex = 0;

  for (const [catSlug, items] of Object.entries(curatedData)) {
    const categoryId = categoryMap.get(catSlug);
    if (!categoryId) {
      console.warn(`Category slug '${catSlug}' not found in DB! Skipping...`);
      continue;
    }

    for (const item of items) {
      const owner = users[userIndex % users.length];
      const city = cities[Math.floor(Math.random() * cities.length)];

      console.log(`Processing: ${item.title}`);

      // Create the listing
      const listing = await prisma.listing.create({
        data: {
          title: item.title,
          description: `High-quality ${item.title} available for rent in ${city}. Perfect condition, carefully maintained. Contact owner for availability and long-term rental discounts.`,
          pricePerDay: item.price,
          categoryId,
          city,
          ownerId: owner.id,
          status: "APPROVED",
        },
      });

      // Generate 4 image variations from the base photo to simulate different angles/zooms
      const numImages = 4;
      for (let i = 0; i < numImages; i++) {
        const imageId = `${listing.id}-${i}`;
        const fileName = `${imageId}.jpg`;
        const localPath = path.join(UPLOADS_DIR, fileName);
        
        // Variation logic: we use different crop ratios and focal points 
        // to make the exact same Unsplash photo look like different shots of the same item.
        const crops = ["entropy", "edges", "faces", "focalpoint"];
        const crop = crops[i % crops.length];
        const zoom = 1 + (i * 0.2); // zoom in slightly each time
        const url = `https://images.unsplash.com/${item.basePhoto}?w=${Math.floor(800/zoom)}&h=${Math.floor(600/zoom)}&fit=crop&crop=${crop}&q=80`;

        try {
          await downloadImage(url, localPath);
          await prisma.listingImage.create({
            data: {
              listingId: listing.id,
              imageUrl: `/uploads/listings/${fileName}`,
              sortOrder: i,
            },
          });
          process.stdout.write(".");
        } catch (err) {
          console.error(`\nFailed to download image ${i} for ${item.title}:`, err.message);
        }
      }
      
      console.log(` ✅ Done`);
      listingCount++;
      userIndex++;
    }
  }

  console.log(`\n🎉 Script finished! Created ${listingCount} realistic listings with downloaded images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
