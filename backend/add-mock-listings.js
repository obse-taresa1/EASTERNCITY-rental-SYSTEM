const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addListings() {
  const users = await prisma.user.findMany({ where: { role: 'USER' } });
  if (users.length === 0) return;

  const categories = await prisma.category.findMany();
  const categorySlugs = categories.map(c => c.slug);
  if (categorySlugs.length === 0) return;

  const items = [
    { title: "Sony A7III Camera", desc: "Full frame mirrorless camera", price: 500, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
    { title: "Makita Drill", desc: "Heavy duty cordless drill", price: 150, img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
    { title: "Toyota Corolla 2020", desc: "Reliable city car", price: 1200, img: "https://images.unsplash.com/photo-1590362891991-f200c8281d24?w=800" },
    { title: "Camping Tent", desc: "4-person waterproof tent", price: 200, img: "https://images.unsplash.com/photo-1504280387937-319b9bc9f635?w=800" },
    { title: "DJI Mavic Drone", desc: "4K drone for aerial photography", price: 800, img: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800" },
    { title: "JBL PartyBox", desc: "Bluetooth party speaker", price: 300, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800" },
    { title: "Foldable Chairs (x10)", desc: "10 plastic folding chairs", price: 100, img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800" },
    { title: "Mountain Bike", desc: "21-speed mountain bicycle", price: 250, img: "https://images.unsplash.com/photo-1576435728678-68ce0f622472?w=800" },
  ];

  let added = 0;
  for (let i = 0; i < 30; i++) {
    const item = items[i % items.length];
    const user = users[Math.floor(Math.random() * users.length)];
    const cat = categorySlugs[Math.floor(Math.random() * categorySlugs.length)];

    await prisma.listing.create({
      data: {
        title: `${item.title} ${i+1}`,
        description: item.desc,
        pricePerDay: item.price,
        city: user.city || 'Addis Ababa',
        status: 'PUBLISHED',
        owner: { connect: { id: user.id } },
        category: { connect: { slug: cat } },
        images: { create: [{ imageUrl: item.img, sortOrder: 0 }] },
      }
    });
    added++;
  }
  console.log(`Added ${added} new listings!`);
}

addListings().catch(console.error).finally(() => prisma.$disconnect());
