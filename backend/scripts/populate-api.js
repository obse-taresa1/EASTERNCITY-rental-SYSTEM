const fs = require('fs');

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
  { title: "Canon EOS R5 Mirrorless Camera", description: "Professional 45MP full-frame mirrorless camera with 8K video capability. Excellent for professional events and weddings.", categorySlug: "electronics-cameras", pricePerDay: 650, images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80"] },
  { title: "Sony A7III Camera Kit", description: "Sony A7III with 28-70mm lens. Great for hybrid shooters needing excellent photo and video performance.", categorySlug: "electronics-cameras", pricePerDay: 450, images: ["https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=1200&q=80"] },
  { title: "Alienware Gaming Laptop RTX 4080", description: "High-end gaming laptop for esports and VR gaming. 32GB RAM, 1TB NVMe, stunning display.", categorySlug: "gadgets", pricePerDay: 800, images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80"] },
  { title: "MacBook Pro M3 Max", description: "Perfect for video editing, coding, and heavy creative workflows. 16-inch screen, 64GB RAM.", categorySlug: "electronics-cameras", pricePerDay: 900, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80"] },
  { title: "iPhone 15 Pro Max Titanium", description: "Latest iPhone in excellent condition. Ideal for mobile content creation and vlogging.", categorySlug: "gadgets", pricePerDay: 300, images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=80"] },
  { title: "Heavy Duty Concrete Mixer", description: "Portable cement mixer for construction. 120L capacity, electric powered.", categorySlug: "construction-diy", pricePerDay: 1200, images: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80"] },
  { title: "Makita 18V Cordless Drill Set", description: "Professional power drill with 2 batteries and full bit set. Great for DIY.", categorySlug: "tools", pricePerDay: 150, images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80"] },
  { title: "Honda Portable Generator 3000W", description: "Reliable backup power generator for outdoor events or construction sites.", categorySlug: "tools", pricePerDay: 850, images: ["https://images.unsplash.com/photo-1616781296065-388277a94ff6?w=1200&q=80"] },
  { title: "Toyota Corolla 2022", description: "Fuel efficient, automatic transmission, air conditioning. Perfect for city driving and weekend trips.", categorySlug: "vehicles", pricePerDay: 1500, images: ["https://images.unsplash.com/photo-1590362891991-f200c8281d24?w=1200&q=80"] },
  { title: "Mountain Bike Trek Marlin", description: "Professional trail mountain bicycle with 21-speed gears, front suspension, and disc brakes.", categorySlug: "sports-outdoor", pricePerDay: 200, images: ["https://images.unsplash.com/photo-1576435728678-68ce0f622472?w=1200&q=80"] },
  { title: "White Wedding Tent (20x30m)", description: "Elegant white canopy for outdoor weddings and large corporate events. Setup included.", categorySlug: "events", pricePerDay: 3500, images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"] },
  { title: "Plastic Folding Chairs (Stack of 50)", description: "Sturdy white plastic chairs for outdoor events, weddings, and parties.", categorySlug: "party-wedding", pricePerDay: 400, images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80"] },
  { title: "JBL PartyBox 710 Bluetooth Speaker", description: "Massive 800W sound with lights. Perfect for parties, weddings, and outdoor events.", categorySlug: "electronics-cameras", pricePerDay: 500, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&q=80"] },
  { title: "Waterproof Camping Tent (4-Person)", description: "Durable family tent for camping trips. Weather resistant with easy setup.", categorySlug: "travel-camping", pricePerDay: 250, images: ["https://images.unsplash.com/photo-1504280387937-319b9bc9f635?w=1200&q=80"] },
  { title: "Professional Makeup Kit", description: "Complete professional makeup and manicure set for freelance stylists.", categorySlug: "fashion-accessories", pricePerDay: 100, images: ["https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?w=1200&q=80"] }
];

const BASE_URL = 'http://localhost:5000/api';

async function req(path, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function run() {
  console.log("Starting full API workflow simulation...");
  
  // 1. Ensure users exist via DB first so we can log into them
  // (The user already confirmed they exist, but let's just use the API)
  let adminToken = '';
  try {
    const res = await req('/auth/login', 'POST', { email: 'superadmin@example.com', password: 'password123' });
    adminToken = res.data.token || res.data.accessToken;
    console.log("Admin login successful.");
  } catch (e) {
    console.error("Admin login failed. Make sure superadmin exists.");
    return;
  }
  
  // Clean up placeholders
  try {
    const allListings = await req('/listings', 'GET'); // Might not return all if not admin, but let's query DB directly for cleanup just in case.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.listing.deleteMany({
      where: {
        OR: [
          { title: { startsWith: 'Integration' } },
          { title: { startsWith: 'Test' } },
          { title: { startsWith: 'Demo' } },
        ]
      }
    });
    await prisma.$disconnect();
    console.log("Deleted old placeholders via DB (cleanup step).");
  } catch(e) {}
  
  let totalCreated = 0;
  
  for (const user of users) {
    console.log(`\nProcessing user: ${user.name}`);
    let userToken;
    try {
      const loginRes = await req('/auth/login', 'POST', { email: user.email, password: 'Password123!' });
      userToken = loginRes.data.token || loginRes.data.accessToken;
    } catch (e) {
      console.log(`Login failed for ${user.email}, trying to register...`);
      try {
        const regRes = await req('/auth/register', 'POST', { name: user.name, email: user.email, password: 'Password123!' });
        userToken = regRes.data.token || regRes.data.accessToken;
      } catch (err) {
        console.error(`Failed to login or register ${user.email}:`, err.message);
        continue;
      }
    }
    
    // Create 3 listings for this user via API
    for (let i = 0; i < 3; i++) {
      const item = mockItems[Math.floor(Math.random() * mockItems.length)];
      try {
        const payload = {
          title: `${item.title} - ${user.name.split(' ')[0]}`,
          description: item.description,
          pricePerDay: item.pricePerDay,
          categorySlug: item.categorySlug,
          city: user.city,
          location: `${user.city} Downtown`,
          paymentMethod: 'CBE',
          paymentProofUrl: 'mock_proof.jpg',
          images: item.images
        };
        const createRes = await req('/listings', 'POST', payload, userToken);
        const listingId = createRes.data.id;
        console.log(`  Created listing (PENDING): ${listingId}`);
        totalCreated++;
      } catch (e) {
        console.error(`  Failed to create listing for ${user.email}:`, e.message);
      }
    }
  }
  
  console.log(`\nCreated ${totalCreated} listings successfully. Now approving all as admin...`);
  
  try {
    const pendingRes = await req('/admin/listings?status=PENDING', 'GET', null, adminToken);
    const pendingListings = pendingRes.data.listings || pendingRes.data;
    
    let approved = 0;
    for (const listing of pendingListings) {
      await req(`/admin/listings/${listing.id}/status`, 'PATCH', { status: 'PUBLISHED' }, adminToken);
      approved++;
    }
    console.log(`Admin approved ${approved} listings! Workflow complete.`);
  } catch (e) {
    console.error("Failed to approve listings:", e.message);
  }
}

run().catch(console.error);
