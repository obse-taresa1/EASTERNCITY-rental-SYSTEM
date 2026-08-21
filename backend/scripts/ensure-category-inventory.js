/**
 * Non-destructive marketplace seeder.
 * It only fills categories whose approved inventory is below six listings.
 * Run after the owner/category migrations have been applied.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const imageLibrary = require('../data/curated-image-library.json');
const prisma = new PrismaClient();

const catalog = {
  'cars-bikes': ['Toyota Corolla', 'Toyota Yaris', 'Toyota Hilux', 'Hyundai Tucson', 'Nissan Patrol', 'Bajaj Three-Wheeler'],
  vehicles: ['Toyota Hilux Pickup', 'Nissan Patrol SUV', 'Hyundai Tucson SUV', 'Ford Ranger Pickup', 'Toyota Hiace Van', 'Mitsubishi Canter Truck'],
  'electronics-cameras': ['Canon DSLR Camera Kit', 'Nikon DSLR Camera Kit', 'Sony Mirrorless Camera', 'GoPro Action Camera', 'DJI Drone Kit', '4K Projector'],
  'party-wedding': ['Wedding Chairs Set', 'Banquet Tables Set', 'Wedding Tent', 'Stage Platform', 'Wedding Decoration Package', 'Red Carpet Set'],
  'event-essentials': ['Portable Generator', 'Event Extension Cable Set', 'LED Event Light Kit', 'Stage Platform', 'Crowd Barrier Set', 'Canopy Tent'],
  'construction-diy': ['Concrete Mixer', 'Electric Drill Set', 'Hammer Drill', 'Tile Cutter', 'Aluminium Ladder', 'Pressure Washer'],
  furniture: ['Sofa Set', 'Dining Table', 'Office Desk', 'Office Chair', 'Wardrobe', 'Conference Table'],
  'home-appliances': ['Refrigerator', 'Washing Machine', 'Chest Freezer', 'Microwave Oven', 'Water Dispenser', 'Vacuum Cleaner'],
  'sports-outdoor': ['Mountain Bike', 'Camping Tent', 'Football Kit', 'Treadmill', 'Camping Chair Set', 'Barbecue Grill'],
  'travel-camping': ['Camping Tent', 'Sleeping Bag', 'Travel Backpack', 'Camping Stove', 'Cooler Box', 'Lantern Kit'],
  'office-equipment': ['Laser Printer', 'Color Printer', 'Photocopier', 'Projector Screen', 'Office Chair Set', 'Whiteboard'],
  'beauty-salon': ['Barber Chair', 'Salon Styling Chair', 'Facial Steamer', 'Professional Hair Dryer', 'Massage Bed', 'Wax Heater'],
  'baby-kids': ['Baby Stroller', 'Baby Crib', 'Child Car Seat', 'Baby Walker', 'Baby High Chair', 'Playpen'],
  gaming: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Gaming Chair', 'VR Headset', 'Gaming Monitor'],
  'gaming-equipment': ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Gaming Chair', 'VR Headset', 'Gaming Monitor'],
  gadgets: ['iPhone Pro Camera Kit', 'Android Test Phone', 'Portable Power Bank Set', 'Smart Projector', 'Tablet With Keyboard', 'Bluetooth Speaker'],
  'music-audio': ['PA Speaker Pair', 'Wireless Microphone Set', 'Audio Mixer', 'DJ Controller', 'Subwoofer', 'Portable Karaoke System'],
  'fashion-accessories': ['Formal Suit Set', 'Evening Dress', 'Traditional Wedding Outfit', 'Leather Travel Bag', 'Professional Camera Bag', 'Event Shoe Collection'],
};

const prices = [350, 500, 750, 1000, 1500, 2200];
const cities = ['Jigjiga', 'Dire Dawa', 'Harar'];
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function main() {
  const [categories, owners] = await Promise.all([
    prisma.category.findMany({ orderBy: { slug: 'asc' } }),
    prisma.user.findMany({ where: { role: 'USER', email: { endsWith: '@gmail.com' } }, select: { id: true }, orderBy: { createdAt: 'asc' } }),
  ]);
  if (!owners.length) throw new Error('No Gmail owner accounts found. Apply the owner email migration first.');
  const missingImageSets = [];
  for (const category of categories) {
    for (const name of (catalog[category.slug] || [])) {
      const imageSet = imageLibrary[normalize(name)];
      if (imageSet && imageSet.categorySlug === category.slug && imageSet.images.length >= 3 && imageSet.images.length <= 10) continue;
      const approvedCount = await prisma.listing.count({ where: { categoryId: category.id, status: { in: ['APPROVED', 'ACTIVE', 'FEATURED'] } } });
      const existing = await prisma.listing.count({ where: { categoryId: category.id, title: name } });
      if (approvedCount < 6 && !existing) missingImageSets.push(`${name} (${category.slug})`);
    }
  }
  if (missingImageSets.length) {
    throw new Error(`Curated image library is incomplete. No records were created. Add: ${missingImageSets.join(', ')}`);
  }
  let ownerIndex = 0;
  let created = 0;
  for (const category of categories) {
    const names = catalog[category.slug] || [];
    if (!names.length) continue;
    const approvedCount = await prisma.listing.count({ where: { categoryId: category.id, status: { in: ['APPROVED', 'ACTIVE', 'FEATURED'] } } });
    const existingTitles = new Set((await prisma.listing.findMany({ where: { categoryId: category.id }, select: { title: true } })).map((item) => item.title));
    const needed = Math.max(0, 6 - approvedCount);
    for (const [offset, name] of names.filter((item) => !existingTitles.has(item)).slice(0, needed).entries()) {
      const imageSet = imageLibrary[normalize(name)];
      if (!imageSet || imageSet.categorySlug !== category.slug || imageSet.images.length < 3 || imageSet.images.length > 10) {
        throw new Error(`No validated item-specific image set for "${name}" (${category.slug}). Add it to backend/data/curated-image-library.json before seeding.`);
      }
      const owner = owners[ownerIndex++ % owners.length];
      const city = cities[(created + offset) % cities.length];
      const listing = await prisma.listing.create({ data: { title: name, description: `${name} available for reliable short-term rental in ${city}. Professionally maintained and ready for pickup or delivery.`, ownerId: owner.id, categoryId: category.id, city, location: city, pricePerDay: prices[(created + offset) % prices.length], status: 'APPROVED', approvedAt: new Date(), paymentStatus: 'PAID' } });
      await prisma.listingImage.createMany({ data: imageSet.images.map((image, imageIndex) => ({ listingId: listing.id, sortOrder: imageIndex, imageUrl: image.url })) });
      created += 1;
    }
  }
  console.log(`Created ${created} listings. Existing records were preserved.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
