const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();



// Source hero images (frontend assets)
const FRONTEND_ASSETS = path.resolve(__dirname, '..', 'frontend', 'src', 'assets', 'images');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads', 'listings');

function copyHeroImage(srcFilename) {
  const src = path.join(FRONTEND_ASSETS, srcFilename);
  const destName = `hero-${srcFilename}`;
  const dest = path.join(UPLOADS_DIR, destName);
  if (!fs.existsSync(src)) {
    console.warn(`  WARNING: source not found: ${src}`);
    return null;
  }
  fs.copyFileSync(src, dest);
  console.log(`  Copied ${srcFilename} → ${destName}`);
  return `/uploads/listings/${destName}`;
}

const itemsToSeed = [
  {
    title: "Toyota RAV4 2023",
    description: "Automatic, Petrol, 5 Seats. Trusted vehicle rentals from local owners.",
    categorySlug: "vehicles",
    city: "Jigjiga",
    location: "Jigjiga",
    pricePerDay: 8500,
    heroImages: ["hero_vehicles.png"],
  },
  {
    title: "Gaming Laptop RTX 4070",
    description: "RTX 4070, 16GB RAM, 1TB SSD. High performance gaming laptop.",
    categorySlug: "gaming",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 4500,
    heroImages: ["hero_electronics.png"],
  },
  {
    title: "Canon EOS DSLR Kit",
    description: "24.2 MP, 18-55mm Lens, 1080p. Perfect for photography.",
    categorySlug: "electronics-cameras",
    city: "Jigjiga",
    location: "Jigjiga",
    pricePerDay: 6000,
    heroImages: ["hero_camera.png"],
  },
  {
    title: "Modern Sectional Sofa",
    description: "3-Seater, L-Shape, Fabric. Great for living rooms.",
    categorySlug: "furniture",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 7200,
    heroImages: ["furnsofa.png"],
  },
  {
    title: "Mountain Bike Pro",
    description: "21-Speed, Disc Brakes, Suspension. Ideal for trails.",
    categorySlug: "sports-outdoor",
    city: "Harar",
    location: "Harar",
    pricePerDay: 2000,
    heroImages: ["sportbick.png"],
  },
  {
    title: "Wedding Tent 20x30m",
    description: "200 Capacity, Lighting, Setup. Make your event memorable.",
    categorySlug: "party-wedding",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 8000,
    heroImages: ["party_wedding_chairs.jpg"],
  },
  {
    title: "DeWalt Drill Set",
    description: "Cordless, 20V, Brushless. Professional grade tools.",
    categorySlug: "tools",
    city: "Harar",
    location: "Harar",
    pricePerDay: 500,
    heroImages: ["dewalt.png"],
  },
  {
    title: "Wedding Chairs (Set of 50)",
    description: "Plastic, White, Stackable. Perfect for weddings.",
    categorySlug: "party-wedding",
    city: "Jigjiga",
    location: "Jigjiga",
    pricePerDay: 1500,
    heroImages: ["party_wedding_chairs.jpg"],
  },
];

async function run() {
  // Step 1: Delete the existing hero listings by title
  console.log('\n=== Deleting existing hero listings by title ===');
  const titlesToDelete = itemsToSeed.map(item => item.title);
  
  const existingListings = await prisma.listing.findMany({
    where: { title: { in: titlesToDelete } }
  });

  for (const listing of existingListings) {
    try {
      // Delete images first (foreign key)
      await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
      await prisma.listing.delete({ where: { id: listing.id } });
      console.log(`  Deleted listing ${listing.id} (${listing.title})`);
    } catch (err) {
      console.log(`  Skipped ${listing.id} (${err.message?.slice(0, 60)})`);
    }
  }

  // Step 2: Find owner and admin
  const owner = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'superadmin@example.com' } });
  if (!owner || !admin) {
    console.error('Owner or Admin not found!');
    return;
  }

  const allCats = await prisma.category.findMany();

  // Step 3: Copy images and create listings
  console.log('\n=== Creating hero listings with correct images ===');
  for (const item of itemsToSeed) {
    let cat = allCats.find(c => c.slug === item.categorySlug);
    if (!cat) {
      console.warn(`  Category not found for slug: ${item.categorySlug}, using first`);
      cat = allCats[0];
    }

    // Copy images from frontend assets to backend uploads
    const imageUrls = [];
    for (const imgFile of item.heroImages) {
      const url = copyHeroImage(imgFile);
      if (url) imageUrls.push(url);
    }

    if (imageUrls.length === 0) {
      console.warn(`  No images found for ${item.title}, skipping`);
      continue;
    }

    const created = await prisma.listing.create({
      data: {
        title: item.title,
        description: item.description,
        ownerId: owner.id,
        categoryId: cat.id,
        city: item.city,
        location: item.location,
        pricePerDay: item.pricePerDay,
        status: 'APPROVED',
        approvedById: admin.id,
        approvedAt: new Date(),
        images: {
          create: imageUrls.map((url, i) => ({
            imageUrl: url,
            sortOrder: i,
          })),
        },
      },
    });

    console.log(`  Created "${item.title}" → ${created.id} (${imageUrls.length} images)`);
  }

  console.log('\nDone!');
}

run().finally(() => prisma.$disconnect());
