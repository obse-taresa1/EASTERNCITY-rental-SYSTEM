const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const itemsToSeed = [
  {
    title: "Toyota RAV4 2023",
    description: "Automatic, Petrol, 5 Seats. Trusted vehicle rentals from local owners.",
    categorySlug: "vehicles",
    city: "Jigjiga",
    location: "Jigjiga",
    pricePerDay: 8500,
    images: [
      "https://picsum.photos/seed/rav4-front/800/600",
      "https://picsum.photos/seed/rav4-side/800/600",
      "https://picsum.photos/seed/rav4-rear/800/600",
    ],
  },
  {
    title: "Gaming Laptop RTX 4070",
    description: "RTX 4070, 16GB RAM, 1TB SSD. High performance gaming laptop.",
    categorySlug: "gaming",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 4500,
    images: [
      "/src/assets/images/hero_electronics.png",
      "/src/assets/images/hero_electronics.png",
      "/src/assets/images/hero_electronics.png",
    ],
  },
  {
    title: "Canon EOS DSLR Kit",
    description: "24.2 MP, 18-55mm Lens, 1080p. Perfect for photography.",
    categorySlug: "electronics-cameras",
    city: "Jigjiga",
    location: "Jigjiga",
    pricePerDay: 6000,
    images: [
      "/src/assets/images/hero_camera.png",
      "/src/assets/images/hero_camera.png",
      "/src/assets/images/hero_camera.png",
    ],
  },
  {
    title: "Modern Sectional Sofa",
    description: "3-Seater, L-Shape, Fabric. Great for living rooms.",
    categorySlug: "furniture",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 7200,
    images: [
      "/src/assets/images/furnsofa.png",
      "/src/assets/images/furnsofa.png",
      "/src/assets/images/furnsofa.png",
    ],
  },
  {
    title: "Mountain Bike Pro",
    description: "21-Speed, Disc Brakes, Suspension. Ideal for trails.",
    categorySlug: "sports-outdoor",
    city: "Harar",
    location: "Harar",
    pricePerDay: 2000,
    images: [
      "/src/assets/images/sportbick.png",
      "/src/assets/images/sportbick.png",
      "/src/assets/images/sportbick.png",
    ],
  },
  {
    title: "Wedding Tent 20x30m",
    description: "200 Capacity, Lighting, Setup. Make your event memorable.",
    categorySlug: "party-wedding",
    city: "Dire Dawa",
    location: "Dire Dawa",
    pricePerDay: 8000,
    images: [
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&h=800&fit=crop",
    ],
  },
  {
    title: "DeWalt Drill Set",
    description: "Cordless, 20V, Brushless. Professional grade tools.",
    categorySlug: "tools",
    city: "Harar",
    location: "Harar",
    pricePerDay: 500,
    images: [
      "/src/assets/images/dewalt.png",
      "/src/assets/images/dewalt.png",
      "/src/assets/images/dewalt.png",
    ],
  },
];

async function run() {
  const owner = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'superadmin@example.com' } });

  if (!owner || !admin) {
    console.error("Owner or Admin not found!");
    return;
  }

  const allCats = await prisma.category.findMany();

  for (const item of itemsToSeed) {
    let cat = allCats.find(c => c.slug === item.categorySlug);
    if (!cat) {
      console.warn("Category not found for slug:", item.categorySlug, "using first cat");
      cat = allCats[0];
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
        status: "APPROVED",
        approvedById: admin.id,
        approvedAt: new Date(),
        images: {
          create: item.images.map(url => ({
            imageUrl: url
          }))
        }
      }
    });

    console.log(`Created item ${item.title} with ID: ${created.id}`);
  }
}

run().finally(() => prisma.$disconnect());
