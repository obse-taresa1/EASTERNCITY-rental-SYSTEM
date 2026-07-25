require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@example.com';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'password123';
  const name = process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin';

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, password: passwordHash, role: 'SUPER_ADMIN' },
    create: { name, email, password: passwordHash, role: 'SUPER_ADMIN' },
    select: { id: true, email: true, role: true },
  });
}

async function ensureCategories() {
  const needed = [
    { slug: 'electronics-cameras', name: 'Electronics & Cameras' },
    { slug: 'party-wedding', name: 'Party & Wedding' },
    { slug: 'vehicles', name: 'Vehicles' },
    { slug: 'cars-bikes', name: 'Cars & Bikes' },
    { slug: 'events', name: 'Events' },
    { slug: 'furniture', name: 'Furniture' },
    { slug: 'sports-outdoor', name: 'Sports & Outdoor' },
    { slug: 'construction-diy', name: 'Construction & DIY' },
    { slug: 'gadgets', name: 'Gadgets' },
    { slug: 'home-appliances', name: 'Home Appliances' },
    { slug: 'fashion-accessories', name: 'Fashion & Accessories' },
    { slug: 'travel-camping', name: 'Travel & Camping' },
    { slug: 'tools', name: 'Tools' },
  ];

  for (const cat of needed) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, name: cat.name },
    });
  }
}

async function createMockData() {
  const hash = (pw) => bcrypt.hash(pw, 10);

  const [rahma, obse, mahhi] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'rahma@example.com' },
      update: {},
      create: { name: 'Rahma', email: 'rahma@example.com', password: await hash('password123'), city: 'Jigjiga', role: 'USER', verificationStatus: 'APPROVED' },
    }),
    prisma.user.upsert({
      where: { email: 'obse@example.com' },
      update: {},
      create: { name: 'Obse', email: 'obse@example.com', password: await hash('password123'), city: 'Dire Dawa', role: 'USER', verificationStatus: 'APPROVED' },
    }),
    prisma.user.upsert({
      where: { email: 'mahhi@example.com' },
      update: {},
      create: { name: 'Mahhi', email: 'mahhi@example.com', password: await hash('password123'), city: 'Harar', role: 'USER', verificationStatus: 'APPROVED' },
    }),
  ]);

  const listingsData = [
    { title: "Nail Set", description: "Professional manicure kit containing nail clippers, files, buffers, cuticle tools, and accessories.", categorySlug: "fashion-accessories", pricePerDay: 50, city: "Jigjiga", ownerId: rahma.id, imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=1200&h=800&fit=crop" },
    { title: "DSLR Camera", description: "Canon DSLR camera with lens. High-quality 24MP sensor, perfect for professional event photography.", categorySlug: "electronics-cameras", pricePerDay: 400, city: "Jigjiga", ownerId: rahma.id, imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=800&fit=crop" },
    { title: "Gaming Laptop", description: "RGB gaming laptop with RTX 4070 GPU, 32GB RAM, and 1TB SSD. Ready for high-end gaming and rendering.", categorySlug: "gadgets", pricePerDay: 500, city: "Jigjiga", ownerId: rahma.id, imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&h=800&fit=crop" },
    
    { title: "Plastic Chairs", description: "Stack of white rental plastic chairs. Perfect for outdoor weddings, parties, and large gatherings. Includes 50 chairs.", categorySlug: "party-wedding", pricePerDay: 200, city: "Dire Dawa", ownerId: obse.id, imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop" },
    { title: "Wedding Tent", description: "Outdoor event canopy/tent. 20x30m white tent suitable for weddings and outdoor events. Includes setup.", categorySlug: "party-wedding", pricePerDay: 2500, city: "Dire Dawa", ownerId: obse.id, imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop" },
    { title: "Concrete Mixer", description: "Portable concrete mixer machine for construction and DIY projects. Easy to transport and operate.", categorySlug: "construction-diy", pricePerDay: 800, city: "Dire Dawa", ownerId: obse.id, imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&h=800&fit=crop" },
    
    { title: "Generator", description: "Portable gasoline generator. 3000W output, reliable power backup for outdoor events or construction sites.", categorySlug: "tools", pricePerDay: 600, city: "Harar", ownerId: mahhi.id, imageUrl: "https://images.unsplash.com/photo-1616781296065-388277a94ff6?w=1200&h=800&fit=crop" },
    { title: "Projector", description: "Multimedia projector. Full HD 1080p, 4000 lumens. Great for presentations or outdoor movie nights.", categorySlug: "electronics-cameras", pricePerDay: 350, city: "Harar", ownerId: mahhi.id, imageUrl: "https://images.unsplash.com/photo-1579566946654-20ce6dc27b7c?w=1200&h=800&fit=crop" },
    { title: "Mountain Bike", description: "Actual mountain bicycle with 21-speed gears, front suspension, and disc brakes. Excellent for trail riding.", categorySlug: "sports-outdoor", pricePerDay: 150, city: "Harar", ownerId: mahhi.id, imageUrl: "https://images.unsplash.com/photo-1576435728678-68ce0f622472?w=1200&h=800&fit=crop" },
  ];

  const listings = [];
  for (const data of listingsData) {
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        pricePerDay: data.pricePerDay,
        city: data.city,
        status: 'PUBLISHED',
        owner: { connect: { id: data.ownerId } },
        category: { connect: { slug: data.categorySlug } },
        images: { create: [{ imageUrl: data.imageUrl, sortOrder: 0 }] },
      },
    });
    listings.push(listing);
  }

  // --- Bookings ---
  const booking1 = await prisma.booking.create({
    data: {
      listing: { connect: { id: listings[0].id } },
      renter: { connect: { id: obse.id } },
      owner: { connect: { id: rahma.id } },
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-03'),
      subtotal: 100,
      serviceFee: 0,
      totalAmount: 100,
      status: 'ACTIVE',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      listing: { connect: { id: listings[3].id } },
      renter: { connect: { id: mahhi.id } },
      owner: { connect: { id: obse.id } },
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-02'),
      subtotal: 200,
      serviceFee: 0,
      totalAmount: 200,
      status: 'COMPLETED',
    },
  });

  // --- Review ---
  await prisma.review.create({
    data: {
      booking: { connect: { id: booking2.id } },
      listing: { connect: { id: listings[3].id } },
      user: { connect: { id: mahhi.id } },
      rating: 5,
      comment: 'Excellent chairs, perfectly clean and easy to stack.',
    },
  });
}

async function main() {
  await upsertSuperAdmin();
  await ensureCategories();
  await createMockData();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });