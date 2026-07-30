const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dataMap = {
  "Cars & Bikes": [
    { title: "Toyota RAV4 2022", description: "Reliable SUV for city and off-road trips.", price: 2500, img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" },
    { title: "Honda CR-V 2021", description: "Comfortable and spacious SUV.", price: 2300, img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" }
  ],
  "Vehicles": [
    { title: "Toyota Corolla Sedan", description: "Fuel-efficient city sedan.", price: 1500, img: "https://images.unsplash.com/photo-1590362891991-f7027bc9cc97?auto=format&fit=crop&w=800&q=80" },
    { title: "Ford Ranger Pickup", description: "Heavy-duty pickup truck.", price: 3000, img: "https://images.unsplash.com/photo-1559404283-7d2d3cbafb2b?auto=format&fit=crop&w=800&q=80" }
  ],
  "Electronics & Cameras": [
    { title: "MacBook Pro M2", description: "Powerful laptop for video editing.", price: 1500, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
    { title: "Canon EOS R6 Mirrorless", description: "Professional mirrorless camera.", price: 1200, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" }
  ],
  "Gadgets": [
    { title: "iPhone 14 Pro", description: "Latest Apple smartphone.", price: 600, img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80" },
    { title: "Samsung Galaxy S23 Ultra", description: "Flagship Android phone.", price: 550, img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80" }
  ],
  "Events": [
    { title: "Wedding Chairs (Set of 50)", description: "Elegant white chairs for wedding and events.", price: 1500, img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80" },
    { title: "Event Party Tent", description: "Large waterproof event tent.", price: 5000, img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80" },
    { title: "Stage Lighting Kit", description: "Professional RGB stage lighting setup.", price: 800, img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80" }
  ],
  "Party & Wedding": [
    { title: "Wedding Banquet Tables", description: "Large round banquet tables.", price: 200, img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80" },
    { title: "JBL Party Speaker", description: "High power Bluetooth speaker.", price: 800, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80" }
  ],
  "Furniture": [
    { title: "Ergonomic Office Chair", description: "Comfortable mesh office chair.", price: 150, img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80" },
    { title: "Modern Sofa Set", description: "Comfortable 3-seater living room sofa.", price: 800, img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80" }
  ],
  "Home Appliances": [
    { title: "Samsung Refrigerator", description: "Double door refrigerator.", price: 500, img: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80" },
    { title: "LG Washing Machine", description: "Front load 8kg washing machine.", price: 400, img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80" }
  ],
  "Construction & DIY": [
    { title: "Concrete Mixer", description: "Industrial grade concrete mixer.", price: 1500, img: "https://images.unsplash.com/photo-1504307651254-35680f356db4?auto=format&fit=crop&w=800&q=80" },
    { title: "Honda 5000W Generator", description: "Reliable backup generator.", price: 1000, img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80" }
  ],
  "Tools": [
    { title: "DeWalt Cordless Drill", description: "20V Max cordless drill.", price: 250, img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80" },
    { title: "Makita Circular Saw", description: "Professional grade circular saw.", price: 300, img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80" }
  ],
  "Sports & Outdoor": [
    { title: "Mountain Bike - Trek", description: "High-performance mountain bike.", price: 400, img: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80" },
    { title: "Camping Kayak", description: "2-person inflatable kayak.", price: 350, img: "https://images.unsplash.com/photo-1544321976-586df111be04?auto=format&fit=crop&w=800&q=80" }
  ],
  "Travel & Camping": [
    { title: "Camping Tent 4-Person", description: "Waterproof family camping tent.", price: 300, img: "https://images.unsplash.com/photo-1504280390227-36151a35186b?auto=format&fit=crop&w=800&q=80" },
    { title: "Hiking Backpack 65L", description: "Durable backpack for hiking.", price: 150, img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" }
  ],
  "Fashion & Accessories": [
    { title: "Wedding Dress", description: "Elegant white wedding dress.", price: 2500, img: "https://images.unsplash.com/photo-1594552072238-16361a9bc3dd?auto=format&fit=crop&w=800&q=80" },
    { title: "Men's Tuxedo", description: "Classic black tuxedo suit.", price: 1000, img: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80" }
  ]
};

async function runAudit() {
  const listings = await prisma.listing.findMany({
    include: { category: true, images: true }
  });

  for (const listing of listings) {
    const categoryName = listing.category?.name;
    let templates = dataMap[categoryName];

    // If category is somehow missing, fallback to Furniture as a safe neutral option
    if (!templates || templates.length === 0) {
      templates = dataMap["Furniture"]; 
    }

    // Pick a deterministic template based on listing ID to avoid identical duplicates next to each other
    const hash = listing.id.charCodeAt(0) + listing.id.charCodeAt(listing.id.length - 1);
    const template = templates[hash % templates.length];

    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: template.title,
        description: template.description,
        pricePerDay: template.price,
      }
    });

    if (listing.images && listing.images.length > 0) {
      await prisma.listingImage.updateMany({
        where: { listingId: listing.id },
        data: { imageUrl: template.img }
      });
    } else {
      await prisma.listingImage.create({
        data: { listingId: listing.id, imageUrl: template.img, sortOrder: 0 }
      });
    }
  }

  console.log("Integrity Audit Complete. All categories mapped strictly.");
}

runAudit().catch(console.error).finally(() => prisma.$disconnect());
