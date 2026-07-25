const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const users = [
  { name: 'Elias Tadesse', email: 'eliastadesse681@mail.tm', city: 'Harar' },
  { name: 'Martha Alemu', email: 'marthaalemu824@mail.tm', city: 'Jigjiga' },
  { name: 'Saron Assefa', email: 'saronassefa223@mail.tm', city: 'Dire Dawa' },
  { name: 'Hawa Ibrahim', email: 'hawaibrahim744@mail.tm', city: 'Harar' },
  { name: 'Bethlehem Desta', email: 'bethlehemdesta950@mail.tm', city: 'Jigjiga' },
  { name: 'Hana Tesfaye', email: 'hanatesfaye52@mail.tm', city: 'Harar' },
  { name: 'Sara Yonas', email: 'sarayonas23@mail.tm', city: 'Dire Dawa' },
  { name: 'Ahmed Ali', email: 'ahmedali634@mail.tm', city: 'Harar' },
  { name: 'Ruth Solomon', email: 'ruthsolomon653@mail.tm', city: 'Dire Dawa' },
  { name: 'Mustafe Ibrahim', email: 'mustafeibrahim652@mail.tm', city: 'Harar' },
  { name: 'Dawit Solomon', email: 'dawitsolomon431@mail.tm', city: 'Jigjiga' },
  { name: 'Mohamed Hassan', email: 'mohamedhassan208@mail.tm', city: 'Harar' },
  { name: 'Fadumo Ali', email: 'fadumoali917@mail.tm', city: 'Harar' },
  { name: 'Meron Girma', email: 'merongirma665@mail.tm', city: 'Harar' },
  { name: 'Lidia Tadesse', email: 'lidiatadesse202@mail.tm', city: 'Dire Dawa' }
];

const mockItems = [
  { title: "Canon EOS R5 Mirrorless Camera", desc: "Professional 45MP full-frame mirrorless camera with 8K video capability. Excellent for professional events and weddings.", categorySlug: "electronics-cameras", price: 650, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80" },
  { title: "Sony A7III Camera Kit", desc: "Sony A7III with 28-70mm lens. Great for hybrid shooters needing excellent photo and video performance.", categorySlug: "electronics-cameras", price: 450, img: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=1200&q=80" },
  { title: "Alienware Gaming Laptop RTX 4080", desc: "High-end gaming laptop for esports and VR gaming. 32GB RAM, 1TB NVMe, stunning display.", categorySlug: "gadgets", price: 800, img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80" },
  { title: "MacBook Pro M3 Max", desc: "Perfect for video editing, coding, and heavy creative workflows. 16-inch screen, 64GB RAM.", categorySlug: "electronics-cameras", price: 900, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80" },
  { title: "iPhone 15 Pro Max Titanium", desc: "Latest iPhone in excellent condition. Ideal for mobile content creation and vlogging.", categorySlug: "gadgets", price: 300, img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80" },
  
  { title: "Heavy Duty Concrete Mixer", desc: "Portable cement mixer for construction. 120L capacity, electric powered.", categorySlug: "construction-diy", price: 1200, img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80" },
  { title: "Makita 18V Cordless Drill Set", desc: "Professional power drill with 2 batteries and full bit set. Great for DIY.", categorySlug: "tools", price: 150, img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80" },
  { title: "Honda Portable Generator 3000W", desc: "Reliable backup power generator for outdoor events or construction sites.", categorySlug: "tools", price: 850, img: "https://images.unsplash.com/photo-1616781296065-388277a94ff6?w=1200&q=80" },
  
  { title: "Toyota Corolla 2022", desc: "Fuel efficient, automatic transmission, air conditioning. Perfect for city driving and weekend trips.", categorySlug: "vehicles", price: 1500, img: "https://images.unsplash.com/photo-1590362891991-f200c8281d24?w=1200&q=80" },
  { title: "Mountain Bike Trek Marlin", desc: "Professional trail mountain bicycle with 21-speed gears, front suspension, and disc brakes.", categorySlug: "sports-outdoor", price: 200, img: "https://images.unsplash.com/photo-1576435728678-68ce0f622472?w=1200&q=80" },
  
  { title: "White Wedding Tent (20x30m)", desc: "Elegant white canopy for outdoor weddings and large corporate events. Setup included.", categorySlug: "events", price: 3500, img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80" },
  { title: "Plastic Folding Chairs (Stack of 50)", desc: "Sturdy white plastic chairs for outdoor events, weddings, and parties.", categorySlug: "party-wedding", price: 400, img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80" },
  { title: "JBL PartyBox 710 Bluetooth Speaker", desc: "Massive 800W sound with lights. Perfect for parties, weddings, and outdoor events.", categorySlug: "electronics-cameras", price: 500, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=80" },
  
  { title: "Waterproof Camping Tent (4-Person)", desc: "Durable family tent for camping trips. Weather resistant with easy setup.", categorySlug: "travel-camping", price: 250, img: "https://images.unsplash.com/photo-1504280387937-319b9bc9f635?w=1200&q=80" },
  { title: "Modern Sofa Set", desc: "L-shaped living room sofa. Clean and comfortable. Available for short-term home staging.", categorySlug: "furniture", price: 600, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80" },
  
  { title: "Bosch Washing Machine", desc: "Front-load washing machine, very clean. Great for temporary accommodation.", categorySlug: "home-appliances", price: 300, img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1200&q=80" },
  { title: "Professional Makeup Kit", desc: "Complete professional makeup and manicure set for freelance stylists.", categorySlug: "fashion-accessories", price: 100, img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=1200&q=80" }
];

async function run() {
  console.log("Cleaning up old placeholder integration listings...");
  await prisma.listing.deleteMany({
    where: {
      OR: [
        { title: { startsWith: 'Integration' } },
        { title: { startsWith: 'Test' } },
        { title: { startsWith: 'Demo' } },
      ]
    }
  });

  const categories = await prisma.category.findMany();
  const categoryMap = {};
  categories.forEach(c => categoryMap[c.slug] = c.id);

  console.log("Ensuring the 15 users exist...");
  const dbUsers = [];
  const hash = await bcrypt.hash('Password123!', 10);
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hash, verificationStatus: 'APPROVED', city: u.city },
      create: { 
        name: u.name, 
        email: u.email, 
        password: hash, 
        city: u.city, 
        role: 'USER', 
        verificationStatus: 'APPROVED' 
      }
    });
    dbUsers.push(user);
  }

  console.log("Creating 45 realistic listings via DB direct (simulating approval)...");
  
  // Create 3 listings per user (45 total)
  let count = 0;
  for (const user of dbUsers) {
    for (let i = 0; i < 3; i++) {
      // Pick a random mock item
      const itemTemplate = mockItems[Math.floor(Math.random() * mockItems.length)];
      
      await prisma.listing.create({
        data: {
          title: `${itemTemplate.title} - ${user.name.split(' ')[0]}`, // Slightly unique
          description: itemTemplate.desc,
          pricePerDay: itemTemplate.price,
          city: user.city,
          status: 'PUBLISHED', // Directly approved as requested by end goal
          owner: { connect: { id: user.id } },
          category: { connect: { slug: itemTemplate.categorySlug } },
          images: { create: [{ imageUrl: itemTemplate.img, sortOrder: 0 }] }
        }
      });
      count++;
    }
  }

  console.log(`Successfully created ${count} approved listings across 15 users.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
