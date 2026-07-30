require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const projectRoot = path.resolve(__dirname, "..", "..");
const sourceImageDir = path.join(projectRoot, "frontend", "src", "assets", "images");
const catalogUploadDir = path.join(projectRoot, "backend", "uploads", "listings", "marketplace-catalog");

function assetUrl(fileName) {
  return `/uploads/listings/marketplace-catalog/${fileName}`;
}

function ensureCatalogAssets() {
  fs.mkdirSync(catalogUploadDir, { recursive: true });
  [
    "canon_dslr_kit_1781969013603.png",
    "dewalt_drill_set_1781969024967.png",
    "4k_projector_1781969048940.png",
    "electrospkear.png",
    "electrotv.png",
    "pc.png",
    "gadgets_ps5_vr.jpg",
    "toyota_rav4_2023_1781969002285.png",
    "Toyota RAV4.jpg",
    "vehford.png",
    "vehhonda.png",
    "vehsvu.png",
    "vehcooper.png",
    "sportbick.png",
    "sportclim.png",
    "sportgolf.png",
    "sportkeay.png",
    "sportpandel.png",
    "toolsaw.png",
    "toolorbit.png",
    "toollaw.png",
    "waterpp.png",
    "furnsofa.png",
    "furndesk.png",
    "furndinning.png",
    "furnchair.png",
    "furnshelf.png",
    "party_wedding_chairs.jpg",
    "fashion_evening_dress.jpg",
    "beauty_salon_station.jpg",
    "projector.png",
  ].forEach((fileName) => {
    const source = path.join(sourceImageDir, fileName);
    const destination = path.join(catalogUploadDir, fileName);
    if (fs.existsSync(source)) fs.copyFileSync(source, destination);
  });
}

const catalog = {
  "cars-bikes": [
    {
      title: "Honda Civic Sedan 2022",
      description:
        "Clean automatic Honda Civic sedan with air conditioning, Bluetooth audio, and excellent fuel economy. Ideal for city trips and short intercity rentals. Condition: excellent. Deposit: ETB 6,000.",
      pricePerDay: 1500,
      imageUrl: assetUrl("vehhonda.png"),
    },
    {
      title: "Yamaha MT-07 Motorcycle",
      description:
        "Well-maintained Yamaha MT-07 motorcycle with responsive brakes, clean tires, and helmet included. Best for experienced riders. Condition: very good. Deposit: ETB 5,000.",
      pricePerDay: 900,
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Trek Mountain Bike",
      description:
        "Durable Trek mountain bike with front suspension, disc brakes, and 21-speed gearing. Includes helmet and lock. Condition: excellent. Deposit: ETB 2,000.",
      pricePerDay: 600,
      imageUrl: assetUrl("sportbick.png"),
    },
  ],
  vehicles: [
    {
      title: "Toyota RAV4 SUV",
      description:
        "Reliable 5-seater Toyota RAV4 SUV with automatic transmission, cold AC, and generous luggage space. Great for family travel. Condition: excellent. Deposit: ETB 8,000.",
      pricePerDay: 2500,
      imageUrl: assetUrl("toyota_rav4_2023_1781969002285.png"),
    },
    {
      title: "Ford Ranger Pickup",
      description:
        "Strong Ford Ranger pickup for hauling equipment and rural-road trips. Clean cabin, high clearance, and dependable diesel engine. Condition: very good. Deposit: ETB 10,000.",
      pricePerDay: 3200,
      imageUrl: assetUrl("vehford.png"),
    },
    {
      title: "Hyundai Tucson SUV",
      description:
        "Comfortable Hyundai Tucson SUV with automatic transmission and clean interior. Suitable for business, family, and weekend rentals. Condition: very good. Deposit: ETB 7,000.",
      pricePerDay: 2200,
      imageUrl: assetUrl("vehsvu.png"),
    },
  ],
  "electronics-cameras": [
    {
      title: "Canon EOS DSLR Camera Kit",
      description:
        "Canon DSLR camera kit with zoom lens, battery, charger, and memory card. Perfect for events, portraits, and product photography. Condition: excellent. Deposit: ETB 4,000.",
      pricePerDay: 600,
      imageUrl: assetUrl("canon_dslr_kit_1781969013603.png"),
    },
    {
      title: "MacBook Pro Laptop",
      description:
        "High-performance MacBook Pro for editing, coding, presentations, and creative work. Includes charger and protective sleeve. Condition: excellent. Deposit: ETB 8,000.",
      pricePerDay: 900,
      imageUrl: assetUrl("pc.png"),
    },
    {
      title: "Full HD Projector",
      description:
        "Bright Full HD projector with HDMI input and remote control. Suitable for meetings, training, and movie nights. Condition: very good. Deposit: ETB 3,000.",
      pricePerDay: 700,
      imageUrl: assetUrl("4k_projector_1781969048940.png"),
    },
    {
      title: "Bluetooth Party Speaker",
      description:
        "Portable Bluetooth speaker with powerful bass, rechargeable battery, and microphone input. Good for small events. Condition: good. Deposit: ETB 2,000.",
      pricePerDay: 500,
      imageUrl: assetUrl("electrospkear.png"),
    },
  ],
  gadgets: [
    {
      title: "iPhone 15 Pro Max",
      description:
        "iPhone 15 Pro Max in excellent condition, ideal for mobile filming, photography, and testing apps. Includes charger cable. Condition: excellent. Deposit: ETB 7,000.",
      pricePerDay: 450,
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Gaming Laptop RTX",
      description:
        "Powerful gaming laptop with dedicated RTX graphics, fast SSD storage, and high-refresh display. Ideal for gaming and design work. Condition: excellent. Deposit: ETB 8,000.",
      pricePerDay: 850,
      imageUrl: assetUrl("pc.png"),
    },
    {
      title: "Sony PlayStation 5",
      description:
        "Sony PlayStation 5 console with two controllers and HDMI cable. Great for parties and weekend gaming. Condition: excellent. Deposit: ETB 5,000.",
      pricePerDay: 600,
      imageUrl: assetUrl("gadgets_ps5_vr.jpg"),
    },
  ],
  "construction-diy": [
    {
      title: "Portable Concrete Mixer",
      description:
        "Portable concrete mixer for small construction jobs, plastering, and home renovation projects. Easy to transport and operate. Condition: good. Deposit: ETB 4,000.",
      pricePerDay: 900,
      imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "DeWalt Power Drill Set",
      description:
        "Cordless DeWalt drill with bit set, charger, and spare battery. Suitable for drilling wood, metal, and masonry. Condition: excellent. Deposit: ETB 1,500.",
      pricePerDay: 350,
      imageUrl: assetUrl("dewalt_drill_set_1781969024967.png"),
    },
    {
      title: "Portable Generator",
      description:
        "Portable gasoline generator for construction sites, backup power, and outdoor events. Stable output and serviced recently. Condition: very good. Deposit: ETB 5,000.",
      pricePerDay: 1000,
      imageUrl: "https://images.unsplash.com/photo-1616781296065-388277a94ff6?q=80&w=1200&auto=format&fit=crop",
    },
  ],
  tools: [
    {
      title: "Cordless Drill Set",
      description:
        "Cordless drill set with two batteries, charger, and drill bits. Great for home DIY, carpentry, and installation work. Condition: excellent. Deposit: ETB 1,500.",
      pricePerDay: 300,
      imageUrl: assetUrl("dewalt_drill_set_1781969024967.png"),
    },
    {
      title: "Circular Saw",
      description:
        "High-speed circular saw with sharp blade and safety guard. Suitable for cutting plywood, timber, and boards. Condition: very good. Deposit: ETB 2,000.",
      pricePerDay: 450,
      imageUrl: assetUrl("toolsaw.png"),
    },
    {
      title: "Pressure Washer",
      description:
        "Electric pressure washer for cleaning vehicles, patios, walls, and outdoor equipment. Includes hose and spray gun. Condition: good. Deposit: ETB 2,500.",
      pricePerDay: 500,
      imageUrl: assetUrl("waterpp.png"),
    },
  ],
  "party-wedding": [
    {
      title: "White Wedding Tent 20x30m",
      description:
        "Large white wedding tent suitable for outdoor ceremonies, receptions, and community events. Setup support included. Condition: excellent. Deposit: ETB 8,000.",
      pricePerDay: 3500,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Wedding Chairs Set of 50",
      description:
        "Set of 50 clean white wedding chairs for ceremonies and receptions. Stackable and easy to transport. Condition: very good. Deposit: ETB 3,000.",
      pricePerDay: 800,
      imageUrl: assetUrl("party_wedding_chairs.jpg"),
    },
    {
      title: "Banquet Tables Set",
      description:
        "Five folding banquet tables for weddings, meetings, and outdoor events. Strong frames and clean tabletops. Condition: good. Deposit: ETB 2,500.",
      pricePerDay: 700,
      imageUrl: "https://images.unsplash.com/photo-1530605963955-46ebcd5105e6?q=80&w=1200&auto=format&fit=crop",
    },
  ],
  events: [
    {
      title: "Event Projector Kit",
      description:
        "HD projector kit with HDMI cable and remote for conferences, weddings, and outdoor screenings. Condition: excellent. Deposit: ETB 3,000.",
      pricePerDay: 900,
      imageUrl: assetUrl("projector.png"),
    },
    {
      title: "Wedding Chairs Set",
      description:
        "Clean white event chairs for ceremonies, conferences, and community gatherings. Stackable, well-kept, and easy to transport. Condition: very good. Deposit: ETB 3,000.",
      pricePerDay: 800,
      imageUrl: assetUrl("party_wedding_chairs.jpg"),
    },
    {
      title: "Outdoor Event Tent",
      description:
        "White outdoor event tent for ceremonies, exhibitions, and community gatherings. Clean canopy and sturdy poles. Condition: very good. Deposit: ETB 7,000.",
      pricePerDay: 3000,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop",
    },
  ],
  furniture: [
    {
      title: "Modern Sofa Set",
      description:
        "Comfortable modern sofa set with clean upholstery, ideal for temporary housing, staging, and events. Condition: very good. Deposit: ETB 4,000.",
      pricePerDay: 1200,
      imageUrl: assetUrl("furnsofa.png"),
    },
    {
      title: "Wooden Dining Table",
      description:
        "Six-seater wooden dining table with sturdy legs and polished surface. Suitable for family events and temporary setups. Condition: good. Deposit: ETB 3,000.",
      pricePerDay: 800,
      imageUrl: assetUrl("furndinning.png"),
    },
    {
      title: "Office Desk",
      description:
        "Spacious wooden office desk for remote work, study rooms, and temporary office setups. Condition: very good. Deposit: ETB 2,000.",
      pricePerDay: 500,
      imageUrl: assetUrl("furndesk.png"),
    },
  ],
  "home-appliances": [
    {
      title: "Double Door Refrigerator",
      description:
        "Clean double-door refrigerator with strong cooling performance. Suitable for homes, events, and temporary rentals. Condition: very good. Deposit: ETB 5,000.",
      pricePerDay: 900,
      imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Front Load Washing Machine",
      description:
        "Front-load washing machine with multiple wash programs and efficient water use. Condition: very good. Deposit: ETB 4,000.",
      pricePerDay: 700,
      imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Microwave Oven",
      description:
        "Compact microwave oven for heating meals and light cooking. Clean interior and simple controls. Condition: good. Deposit: ETB 1,500.",
      pricePerDay: 250,
      imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1200&auto=format&fit=crop",
    },
  ],
  "sports-outdoor": [
    {
      title: "Trek Mountain Bike",
      description:
        "Well-maintained Trek mountain bike suitable for city roads and off-road trails. Includes helmet and lock. Condition: excellent. Deposit: ETB 2,000.",
      pricePerDay: 600,
      imageUrl: assetUrl("sportbick.png"),
    },
    {
      title: "Climbing Gear Kit",
      description:
        "Complete climbing gear kit with helmet, rope, harness, carabiners, belay device, and chalk bag. Suitable for supervised outdoor climbing. Condition: very good. Deposit: ETB 2,500.",
      pricePerDay: 500,
      imageUrl: assetUrl("sportclim.png"),
    },
    {
      title: "Kayak Set with Paddles",
      description:
        "Recreational kayak set with paddles and basic safety gear for calm-water trips. Clean, stable, and ready for weekend outdoor rentals. Condition: good. Deposit: ETB 2,000.",
      pricePerDay: 500,
      imageUrl: assetUrl("sportkeay.png"),
    },
  ],
  "travel-camping": [
    {
      title: "Climbing Gear Kit",
      description:
        "Travel-ready climbing gear kit with helmet, rope, harness, carabiners, and belay device. Best for guided adventure trips. Condition: excellent. Deposit: ETB 2,500.",
      pricePerDay: 500,
      imageUrl: assetUrl("sportclim.png"),
    },
    {
      title: "Stand-Up Paddleboard",
      description:
        "Inflatable stand-up paddleboard with paddle and carry setup for calm-water recreation. Lightweight, stable, and easy to transport. Condition: very good. Deposit: ETB 2,000.",
      pricePerDay: 500,
      imageUrl: assetUrl("sportpandel.png"),
    },
  ],
  "fashion-accessories": [
    {
      title: "Professional Nail Care Kit",
      description:
        "Complete manicure and nail-care kit with clippers, files, buffers, and cuticle tools. Sanitized before every rental. Condition: excellent. Deposit: ETB 500.",
      pricePerDay: 100,
      imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Evening Dress",
      description:
        "Elegant evening dress for formal events and photo sessions. Cleaned and ready to wear. Condition: excellent. Deposit: ETB 2,000.",
      pricePerDay: 500,
      imageUrl: assetUrl("fashion_evening_dress.jpg"),
    },
  ],
};

function pickTemplate(listing, indexByCategory) {
  const slug = listing.category?.slug || "gadgets";
  const templates = catalog[slug] || catalog.gadgets;
  const index = indexByCategory[slug] || 0;
  indexByCategory[slug] = index + 1;
  return templates[index % templates.length];
}

async function replaceImages(tx, listingId, imageUrl) {
  await tx.listingImage.deleteMany({ where: { listingId } });
  await tx.listingImage.create({
    data: {
      listingId,
      imageUrl,
      sortOrder: 0,
    },
  });
}

async function main() {
  ensureCatalogAssets();

  const listings = await prisma.listing.findMany({
    include: { category: true, images: true },
    orderBy: { createdAt: "asc" },
  });

  const indexByCategory = {};
  const updates = [];

  for (const listing of listings) {
    const template = pickTemplate(listing, indexByCategory);
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: template.title,
        description: template.description,
        pricePerDay: template.pricePerDay,
      },
    });
    await replaceImages(prisma, listing.id, template.imageUrl);
    updates.push({
      id: listing.id,
      category: listing.category?.name || "Uncategorized",
      oldTitle: listing.title,
      newTitle: template.title,
      imageUrl: template.imageUrl,
    });
  }

  const integrationLeft = await prisma.listing.count({
    where: {
      OR: [
        { title: { contains: "Integration", mode: "insensitive" } },
        { description: { contains: "Integration", mode: "insensitive" } },
        { title: { equals: "car", mode: "insensitive" } },
        { description: { equals: "yt", mode: "insensitive" } },
      ],
    },
  });

  const savedListings = await prisma.listing.findMany({
    include: { category: true, images: true },
    orderBy: { createdAt: "asc" },
  });
  const mismatches = savedListings
    .map((listing) => {
      const slug = listing.category?.slug || "gadgets";
      const templates = catalog[slug] || catalog.gadgets;
      const matchingTemplate = templates.find((template) => template.title === listing.title);
      const imageUrl = listing.images[0]?.imageUrl || "";

      if (!matchingTemplate) {
        return { id: listing.id, title: listing.title, category: slug, reason: "title is not in category catalog" };
      }
      if (imageUrl !== matchingTemplate.imageUrl) {
        return { id: listing.id, title: listing.title, category: slug, reason: "image does not match title template" };
      }
      if (listing.description !== matchingTemplate.description) {
        return { id: listing.id, title: listing.title, category: slug, reason: "description does not match title template" };
      }
      return null;
    })
    .filter(Boolean);

  console.log(
    JSON.stringify(
      {
        updated: updates.length,
        integrationOrPlaceholderRemaining: integrationLeft,
        catalogMismatchCount: mismatches.length,
        categoryCounts: Object.fromEntries(
          Object.entries(indexByCategory).sort(([a], [b]) => a.localeCompare(b)),
        ),
        mismatches: mismatches.slice(0, 20),
        sample: updates.slice(0, 12),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
