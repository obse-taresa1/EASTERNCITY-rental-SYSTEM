require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listingData = [
  // cars-bikes (slug)
  { categorySlug: 'cars-bikes', title: 'Toyota Corolla 2021', price: 1500, img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'Toyota Hilux 4x4', price: 3000, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'Hyundai Tucson SUV', price: 2500, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'Nissan Patrol V8', price: 5000, img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'TVS Apache Motorcycle', price: 500, img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'Bajaj Three Wheeler', price: 400, img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80' },
  { categorySlug: 'cars-bikes', title: 'Mountain Bike Pro', price: 250, img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80' },
  // electronics-cameras
  { categorySlug: 'electronics-cameras', title: 'Canon EOS 5D Mark IV', price: 1200, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: 'Sony Alpha a7 III', price: 1500, img: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: 'Nikon D850 DSLR', price: 1300, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: 'DJI Mavic 3 Drone', price: 2000, img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: 'GoPro HERO 11 Black', price: 500, img: 'https://images.unsplash.com/photo-1521405617584-1d9867aecad3?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: '4K Home Projector', price: 800, img: 'https://images.unsplash.com/photo-1579737525381-807186bd6106?w=800&q=80' },
  { categorySlug: 'electronics-cameras', title: 'JBL PA Speaker System', price: 1000, img: 'https://images.unsplash.com/photo-1520182205149-1e5e4e7329b4?w=800&q=80' },
  // party-wedding
  { categorySlug: 'party-wedding', title: 'Large Wedding Tent (500 pax)', price: 15000, img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
  { categorySlug: 'party-wedding', title: 'Plastic Chairs Set of 100', price: 500, img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
  { categorySlug: 'party-wedding', title: 'Banquet Tables Set of 10', price: 1000, img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { categorySlug: 'party-wedding', title: 'Wedding Stage Platform', price: 3000, img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80' },
  { categorySlug: 'party-wedding', title: 'Floral Decoration Package', price: 5000, img: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80' },
  { categorySlug: 'party-wedding', title: 'Wedding Arch with Lights', price: 1500, img: 'https://images.unsplash.com/photo-1515004116035-728b975cc232?w=800&q=80' },
  // event-essentials
  { categorySlug: 'event-essentials', title: 'Professional Sound System', price: 4000, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Heavy Duty Generator', price: 2500, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'LED Stage Lighting Kit', price: 1200, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Red Carpet 20 meters', price: 800, img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Portable Air Cooler for Events', price: 600, img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Catering Chafing Dishes', price: 1500, img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
  // construction-diy
  { categorySlug: 'construction-diy', title: 'Heavy Duty Concrete Mixer', price: 1200, img: 'https://images.unsplash.com/photo-1504307651254-35680f356f58?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'Bosch Hammer Drill', price: 300, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'Industrial Air Compressor', price: 800, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'Portable Welding Machine', price: 600, img: 'https://images.unsplash.com/photo-1504917595217-d4f3e5362a5b?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'High Pressure Washer', price: 400, img: 'https://images.unsplash.com/photo-1541888087425-ce81dfc46928?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'Aluminum Extension Ladder 6m', price: 150, img: 'https://images.unsplash.com/photo-1590483736622-398541ce2517?w=800&q=80' },
  { categorySlug: 'construction-diy', title: 'Professional Tile Cutter', price: 200, img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80' },
  // furniture
  { categorySlug: 'furniture', title: 'Modern L-Shape Sofa Set', price: 800, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
  { categorySlug: 'furniture', title: 'Wooden Dining Table 6 Seater', price: 500, img: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80' },
  { categorySlug: 'furniture', title: 'Executive Office Desk', price: 400, img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80' },
  { categorySlug: 'furniture', title: 'Ergonomic Office Chair', price: 200, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80' },
  { categorySlug: 'furniture', title: 'Large Wooden Wardrobe', price: 600, img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80' },
  { categorySlug: 'furniture', title: 'Conference Room Table 10 Seater', price: 1200, img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80' },
  // home-appliances
  { categorySlug: 'home-appliances', title: 'Samsung Double Door Refrigerator', price: 800, img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80' },
  { categorySlug: 'home-appliances', title: 'LG Front Load Washing Machine', price: 600, img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80' },
  { categorySlug: 'home-appliances', title: 'Deep Freezer 300 Liters', price: 500, img: 'https://images.unsplash.com/photo-1571175351749-e8d06f275d85?w=800&q=80' },
  { categorySlug: 'home-appliances', title: 'Panasonic Microwave Oven', price: 150, img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80' },
  { categorySlug: 'home-appliances', title: 'Hot and Cold Water Dispenser', price: 100, img: 'https://images.unsplash.com/photo-1585659722983-38ca8e9af163?w=800&q=80' },
  { categorySlug: 'home-appliances', title: 'Dyson Cordless Vacuum Cleaner', price: 300, img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80' },
  // sports-outdoor
  { categorySlug: 'sports-outdoor', title: 'Commercial Treadmill', price: 1000, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { categorySlug: 'sports-outdoor', title: 'Stationary Exercise Bike', price: 500, img: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80' },
  { categorySlug: 'sports-outdoor', title: 'Adjustable Dumbbell Set 40kg', price: 200, img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80' },
  { categorySlug: 'sports-outdoor', title: 'Professional Foosball Table', price: 800, img: 'https://images.unsplash.com/photo-1541819779344-96e0534927cb?w=800&q=80' },
  { categorySlug: 'sports-outdoor', title: 'Full Football Kit 20 sets', price: 1500, img: 'https://images.unsplash.com/photo-1518605368461-1ee7c51922f1?w=800&q=80' },
  { categorySlug: 'sports-outdoor', title: 'Large Barbecue Grill', price: 400, img: 'https://images.unsplash.com/photo-1529600109968-3e4e41416bb7?w=800&q=80' },
  // travel-camping
  { categorySlug: 'travel-camping', title: '4-Person Waterproof Camping Tent', price: 300, img: 'https://images.unsplash.com/photo-1504280387967-361c6d9e38f4?w=800&q=80' },
  { categorySlug: 'travel-camping', title: 'Thermal Sleeping Bag Set of 2', price: 100, img: 'https://images.unsplash.com/photo-1520114002626-4b2072fec0a6?w=800&q=80' },
  { categorySlug: 'travel-camping', title: 'Portable Camping Gas Stove', price: 80, img: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80' },
  { categorySlug: 'travel-camping', title: '70L Hiking Backpack', price: 120, img: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800&q=80' },
  { categorySlug: 'travel-camping', title: 'Heavy Duty 50L Cooler Box', price: 150, img: 'https://images.unsplash.com/photo-1518469857476-ebf9ff6cb960?w=800&q=80' },
  { categorySlug: 'travel-camping', title: 'Foldable Camping Chairs and Table Set', price: 200, img: 'https://images.unsplash.com/photo-1510312305653-8ed496efae77?w=800&q=80' },
  // office-equipment
  { categorySlug: 'office-equipment', title: 'HP LaserJet Pro Printer', price: 200, img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80' },
  { categorySlug: 'office-equipment', title: 'Heavy Duty Photocopier', price: 1500, img: 'https://images.unsplash.com/photo-1552520638-54c30c345164?w=800&q=80' },
  { categorySlug: 'office-equipment', title: 'High-Speed Document Scanner', price: 300, img: 'https://images.unsplash.com/photo-1528430588506-6192cb24c7d7?w=800&q=80' },
  { categorySlug: 'office-equipment', title: 'Large Whiteboard with Stand', price: 100, img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80' },
  { categorySlug: 'office-equipment', title: 'Epson Business Projector', price: 600, img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80' },
  { categorySlug: 'office-equipment', title: '120-inch Portable Projector Screen', price: 150, img: 'https://images.unsplash.com/photo-1588698188167-28562d96c148?w=800&q=80' },
  // beauty-salon
  { categorySlug: 'beauty-salon', title: 'Professional Barber Chair', price: 400, img: 'https://images.unsplash.com/photo-1521590838700-1c1c73a4b9d0?w=800&q=80' },
  { categorySlug: 'beauty-salon', title: 'Hydraulic Salon Styling Chair', price: 350, img: 'https://images.unsplash.com/photo-1600948836101-f9ff5bb64c76?w=800&q=80' },
  { categorySlug: 'beauty-salon', title: 'Hair Washing Station Sink', price: 500, img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80' },
  { categorySlug: 'beauty-salon', title: 'Foldable Massage Bed', price: 250, img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80' },
  { categorySlug: 'beauty-salon', title: 'Professional Facial Steamer', price: 150, img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80' },
  { categorySlug: 'beauty-salon', title: 'LED Ring Light for Makeup', price: 100, img: 'https://images.unsplash.com/photo-1605230325492-4e4bdf0bf61b?w=800&q=80' },
  // baby-kids
  { categorySlug: 'baby-kids', title: 'Premium Baby Stroller', price: 300, img: 'https://images.unsplash.com/photo-1550517416-2401fcbaeb6d?w=800&q=80' },
  { categorySlug: 'baby-kids', title: 'Wooden Baby Crib with Mattress', price: 400, img: 'https://images.unsplash.com/photo-1512411200257-2e1d713c77ea?w=800&q=80' },
  { categorySlug: 'baby-kids', title: 'Infant Car Seat Safety Rated', price: 250, img: 'https://images.unsplash.com/photo-1597022204739-1ffdb4f6be4e?w=800&q=80' },
  { categorySlug: 'baby-kids', title: 'Large Safe Playpen for Toddlers', price: 150, img: 'https://images.unsplash.com/photo-1616428488809-54d193ef2d4e?w=800&q=80' },
  { categorySlug: 'baby-kids', title: 'Adjustable Baby High Chair', price: 100, img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80' },
  { categorySlug: 'baby-kids', title: 'Automatic Baby Swing Rocker', price: 200, img: 'https://images.unsplash.com/photo-1503460833146-2713f02179b0?w=800&q=80' },
  // gaming
  { categorySlug: 'gaming', title: 'Sony PlayStation 5 Disk Edition', price: 600, img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80' },
  { categorySlug: 'gaming', title: 'Xbox Series X Console', price: 550, img: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80' },
  { categorySlug: 'gaming', title: 'Nintendo Switch OLED', price: 300, img: 'https://images.unsplash.com/photo-1578308333066-6b2169b1658f?w=800&q=80' },
  { categorySlug: 'gaming', title: 'Logitech G923 Racing Wheel and Pedals', price: 400, img: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80' },
  { categorySlug: 'gaming', title: 'Meta Quest 2 VR Headset', price: 350, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80' },
  { categorySlug: 'gaming', title: 'Ergonomic Gaming Chair', price: 200, img: 'https://images.unsplash.com/photo-1598550473369-026871c8cf7c?w=800&q=80' },
];

const cities = ['Harar', 'Dire Dawa', 'Jigjiga'];

async function seedData() {
  console.log('Starting full realistic data population...');
  try {
    // Clean existing data in correct FK order
    console.log('Cleaning old data...');
    await prisma.listingImage.deleteMany();
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.listing.deleteMany();
    console.log('Old data cleared.');

    // Load categories from DB
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    console.log(`Found ${categories.length} categories:`, categories.map(c => c.slug));

    // Load gmail users as owners
    const users = await prisma.user.findMany({
      where: { email: { endsWith: '@gmail.com' } },
      take: 20,
    });

    if (users.length === 0) {
      console.error('No Gmail users found. Cannot seed listings.');
      return;
    }
    console.log(`Using ${users.length} users as owners.`);

    let userIndex = 0;
    let totalCreated = 0;
    let skipped = 0;

    for (const item of listingData) {
      const categoryId = categoryMap.get(item.categorySlug);

      if (!categoryId) {
        console.warn(`  ⚠ Category slug "${item.categorySlug}" not found in DB — skipping "${item.title}"`);
        skipped++;
        continue;
      }

      const owner = users[userIndex % users.length];
      const city = cities[Math.floor(Math.random() * cities.length)];

      // Build 4-6 images by varying the Unsplash quality param
      const imgBase = item.img;
      const imgSet = [
        imgBase,
        imgBase.replace('q=80', 'q=81'),
        imgBase.replace('q=80', 'q=82'),
        imgBase.replace('q=80', 'q=83'),
        imgBase.replace('q=80', 'q=84'),
        imgBase.replace('q=80', 'q=85'),
      ].slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 images

      const newListing = await prisma.listing.create({
        data: {
          title: item.title,
          description: `High-quality ${item.title} available for rent in ${city}. Perfect condition, well maintained. Contact owner for availability and delivery options.`,
          pricePerDay: item.price,
          categoryId: categoryId,
          city: city,
          ownerId: owner.id,
          status: 'APPROVED',
        },
      });

      for (let i = 0; i < imgSet.length; i++) {
        await prisma.listingImage.create({
          data: {
            listingId: newListing.id,
            imageUrl: imgSet[i],
            sortOrder: i,
          },
        });
      }

      totalCreated++;
      userIndex++;
    }

    console.log(`\n✅ Done! Created ${totalCreated} listings, skipped ${skipped}.`);
  } catch (error) {
    console.error('Error during data population:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
