require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// These are the slugs that are MISSING from the DB — we need to create them
const missingCategories = [
  { name: 'Event Essentials', slug: 'event-essentials', description: 'Sound systems, generators, lighting, and event supplies' },
  { name: 'Office Equipment', slug: 'office-equipment', description: 'Printers, copiers, scanners, projectors, and office supplies' },
  { name: 'Beauty & Salon', slug: 'beauty-salon', description: 'Barber chairs, salon equipment, and beauty tools' },
  { name: 'Baby & Kids', slug: 'baby-kids', description: 'Strollers, cribs, car seats, and baby gear' },
  { name: 'Gaming', slug: 'gaming', description: 'Consoles, VR headsets, gaming chairs, and accessories' },
];

// Items to add for missing categories (using their new slugs)
const newItems = [
  // event-essentials
  { categorySlug: 'event-essentials', title: 'Professional Sound System', price: 4000, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Heavy Duty Generator 10KVA', price: 2500, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'LED Stage Lighting Kit', price: 1200, img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Red Carpet 20 Meters', price: 800, img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Portable Air Cooler Industrial', price: 600, img: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80' },
  { categorySlug: 'event-essentials', title: 'Catering Chafing Dish Set', price: 1500, img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
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
  { categorySlug: 'beauty-salon', title: 'LED Ring Light for Makeup Artists', price: 100, img: 'https://images.unsplash.com/photo-1605230325492-4e4bdf0bf61b?w=800&q=80' },
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

async function addMissingCategories() {
  console.log('Adding missing categories...');
  for (const cat of missingCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`  ✅ Created category: ${cat.name}`);
    } else {
      console.log(`  ⏭ Category already exists: ${cat.slug}`);
    }
  }
}

async function addMissingListings() {
  // Reload category map
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const users = await prisma.user.findMany({
    where: { email: { endsWith: '@gmail.com' } },
    take: 20,
  });

  let userIndex = 0;
  let created = 0;

  for (const item of newItems) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Still missing: ${item.categorySlug}`);
      continue;
    }

    const owner = users[userIndex % users.length];
    const city = cities[Math.floor(Math.random() * cities.length)];

    const imgBase = item.img;
    const imgSet = [
      imgBase,
      imgBase.replace('q=80', 'q=81'),
      imgBase.replace('q=80', 'q=82'),
      imgBase.replace('q=80', 'q=83'),
      imgBase.replace('q=80', 'q=84'),
    ].slice(0, Math.floor(Math.random() * 2) + 4);

    const newListing = await prisma.listing.create({
      data: {
        title: item.title,
        description: `High-quality ${item.title} available for rent in ${city}. Perfect condition, well maintained. Contact owner for availability.`,
        pricePerDay: item.price,
        categoryId,
        city,
        ownerId: owner.id,
        status: 'APPROVED',
      },
    });

    for (let i = 0; i < imgSet.length; i++) {
      await prisma.listingImage.create({
        data: { listingId: newListing.id, imageUrl: imgSet[i], sortOrder: i },
      });
    }

    created++;
    userIndex++;
  }

  console.log(`\n✅ Added ${created} new listings from missing categories.`);
}

async function main() {
  try {
    await addMissingCategories();
    await addMissingListings();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
