const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const SUPER_ADMIN = { email: 'superadmin@example.com', password: 'password123' };

const OWNERS = [
  'eliastadesse681@mail.tm', 'marthaalemu824@mail.tm', 'saronassefa223@mail.tm',
  'hawaibrahim744@mail.tm', 'bethlehemdesta950@mail.tm', 'hanatesfaye52@mail.tm',
  'sarayonas23@mail.tm', 'ahmedali634@mail.tm', 'ruthsolomon653@mail.tm',
  'mustafeibrahim652@mail.tm', 'dawitsolomon431@mail.tm', 'mohamedhassan208@mail.tm',
  'fadumoali917@mail.tm', 'merongirma665@mail.tm', 'lidiatadesse202@mail.tm'
];
const CITIES = ['Harar', 'Dire Dawa', 'Jigjiga'];

const LISTINGS = [
  // Electronics & Cameras
  { title: "Canon EOS 5D Mark IV", desc: "Professional DSLR camera. 30.4 MP full-frame sensor.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
  { title: "Sony A7 III Mirrorless", desc: "Advanced mirrorless camera with 4K HDR video capabilities.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=800" },
  { title: "DJI Mavic Pro Drone", desc: "Compact drone with 4K camera and 3-axis gimbal.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800" },
  { title: "Epson 1080p Projector", desc: "High brightness projector for events and movies.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1579566946654-20ce6dc27b7c?w=800" },

  // Cars & Bikes / Vehicles
  { title: "Toyota Corolla 2022", desc: "Reliable automatic sedan, excellent condition.", cat: "cars-bikes", img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800" },
  { title: "Hyundai Tucson SUV", desc: "Spacious 5-seater SUV, perfect for family trips.", cat: "vehicles", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800" },
  { title: "Yamaha MT-07 Motorcycle", desc: "Sport naked bike. Great for city and highway.", cat: "cars-bikes", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" },
  { title: "Ford Transit Van", desc: "Cargo van for moving or transport.", cat: "vehicles", img: "https://images.unsplash.com/photo-1563204928-1ce466c9fcd0?w=800" },

  // Party & Wedding / Events
  { title: "White Wedding Tent", desc: "Large 10x20m white canopy tent for outdoor events.", cat: "party-wedding", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800" },
  { title: "50 Plastic Chairs Set", desc: "Stack of clean white plastic chairs.", cat: "events", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800" },
  { title: "PA Sound System", desc: "Two large speakers, mixer, and microphones.", cat: "events", img: "https://images.unsplash.com/photo-1520166971935-c3c267b2dcb3?w=800" },
  { title: "Banquet Tables", desc: "Set of 5 folding banquet tables.", cat: "party-wedding", img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800" },

  // Furniture
  { title: "L-Shaped Sofa", desc: "Comfortable modern sectional sofa in grey.", cat: "furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" },
  { title: "Dining Table Set", desc: "Wooden dining table with 6 chairs.", cat: "furniture", img: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800" },
  { title: "Office Desk", desc: "Large standing desk with adjustable height.", cat: "furniture", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800" },

  // Home Appliances
  { title: "Bosch Washing Machine", desc: "Front load 8kg washing machine.", cat: "home-appliances", img: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800" },
  { title: "Large Refrigerator", desc: "Double door fridge with freezer.", cat: "home-appliances", img: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800" },
  { title: "Industrial Vacuum", desc: "Heavy duty vacuum cleaner.", cat: "home-appliances", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800" },

  // Construction & DIY / Tools
  { title: "Concrete Mixer Machine", desc: "Electric portable concrete mixer.", cat: "construction-diy", img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800" },
  { title: "Dewalt Power Drill", desc: "Cordless drill with full bit set.", cat: "tools", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
  { title: "Heavy Duty Scaffolding", desc: "Steel scaffolding tower 5 meters.", cat: "construction-diy", img: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800" },
  { title: "3000W Generator", desc: "Portable gasoline generator.", cat: "tools", img: "https://images.unsplash.com/photo-1616781296065-388277a94ff6?w=800" },

  // Gadgets / Fashion-accessories
  { title: "Alienware Gaming Laptop", desc: "Core i9, RTX 3080, 32GB RAM.", cat: "gadgets", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800" },
  { title: "VR Headset Meta Quest", desc: "Standalone VR gaming headset.", cat: "gadgets", img: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800" },
  { title: "Professional Makeup Kit", desc: "Complete makeup artistry kit and case.", cat: "fashion-accessories", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800" },

  // Sports & Outdoor / Travel-camping
  { title: "Mountain Bike Trek", desc: "29 inch full suspension mountain bike.", cat: "sports-outdoor", img: "https://images.unsplash.com/photo-1576435728678-68ce0f622472?w=800" },
  { title: "4-Person Camping Tent", desc: "Waterproof dome tent for camping.", cat: "travel-camping", img: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800" },
  { title: "Treadmill Machine", desc: "Foldable electric treadmill for home fitness.", cat: "sports-outdoor", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800" },
  { title: "Hiking Backpack 60L", desc: "Large trekking backpack with frame.", cat: "travel-camping", img: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=800" },
  
  // Extra listings to reach ~45
  { title: "Sony PlayStation 5", desc: "PS5 console with 2 controllers.", cat: "gadgets", img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800" },
  { title: "DJ Controller Pioneer", desc: "Professional DJ mixing deck.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1516280440502-127e4db926fa?w=800" },
  { title: "Honda Civic Sedan", desc: "Fuel efficient car for daily use.", cat: "cars-bikes", img: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800" },
  { title: "Pickup Truck Toyota", desc: "Hilux double cab for transport.", cat: "vehicles", img: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800" },
  { title: "Chafing Dishes Set", desc: "5 stainless steel food warmers for catering.", cat: "events", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800" },
  { title: "Red Carpet Roll", desc: "10-meter red carpet for VIP events.", cat: "party-wedding", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800" },
  { title: "Double Bed Frame", desc: "Solid wood bed frame without mattress.", cat: "furniture", img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800" },
  { title: "Coffee Maker Espresso", desc: "Commercial espresso machine.", cat: "home-appliances", img: "https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?w=800" },
  { title: "Ladder 4 Meters", desc: "Aluminum extension ladder.", cat: "tools", img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800" },
  { title: "Circular Saw", desc: "Professional wood cutting saw.", cat: "construction-diy", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800" },
  { title: "Nikon D850 DSLR", desc: "High resolution photography camera.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
  { title: "GoPro Hero 11", desc: "Action camera with underwater housing.", cat: "electronics-cameras", img: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800" },
  { title: "Apple iPad Pro", desc: "12.9 inch tablet with Apple Pencil.", cat: "gadgets", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
  { title: "Electric Scooter", desc: "Foldable commuter scooter, 30km range.", cat: "vehicles", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800" },
  { title: "Boxing Gloves & Bag", desc: "Heavy punching bag and gloves.", cat: "sports-outdoor", img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800" },
  { title: "Sleeping Bag", desc: "Warm thermal sleeping bag for camping.", cat: "travel-camping", img: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800" },
  { title: "Outdoor Grill BBQ", desc: "Gas barbecue grill for parties.", cat: "events", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800" }
];

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function downloadImage(url) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.warn(`Warning: Could not download image ${url}, using fallback.`);
    // A reliable fallback image, though we try to avoid it. The user agent should fix the 403/404s.
    const fb = await axios.get('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' }});
    return fb.data;
  }
}

async function login(email, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data.data.accessToken;
}

async function createListing(token, listing, city) {
  const imageBuffer = await downloadImage(listing.img);
  const form = new FormData();
  form.append('title', listing.title);
  form.append('description', listing.desc);
  form.append('pricePerDay', Math.floor(Math.random() * 500) + 100);
  form.append('categorySlug', listing.cat);
  form.append('city', city);
  form.append('location', city + ' Central');
  form.append('condition', 'Good');
  form.append('availability', 'Available');
  form.append('paymentMethod', 'Telebirr');
  
  form.append('images', imageBuffer, {
    filename: `image_${Date.now()}.jpg`,
    contentType: 'image/jpeg'
  });
  
  form.append('paymentProof', imageBuffer, {
    filename: `receipt_${Date.now()}.jpg`,
    contentType: 'image/jpeg'
  });

  const res = await axios.post(`${API_URL}/listings`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders()
    }
  });
  return res.data.data;
}

async function approveListings() {
  const token = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);
  
  // Get pending listings
  const res = await axios.get(`${API_URL}/admin/listings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const allListings = res.data.data || [];
  const pending = allListings.filter(l => l.status === 'PENDING');
  console.log(`Found ${pending.length} pending listings to approve.`);

  for (const l of pending) {
    await axios.patch(`${API_URL}/listings/${l.id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Approved: ${l.title}`);
  }
}

async function main() {
  let listingIndex = 0;
  for (let i = 0; i < OWNERS.length; i++) {
    const ownerEmail = OWNERS[i];
    console.log(`Logging in as ${ownerEmail}...`);
    let token;
    try {
      token = await login(ownerEmail, 'Password123!');
    } catch(err) {
      console.log(`Failed to login ${ownerEmail}:`, err.response?.data || err.message);
      continue;
    }

    const city = CITIES[i % CITIES.length];
    
    // Assign 3 listings per user (or whatever is left)
    for (let j = 0; j < 3; j++) {
      if (listingIndex >= LISTINGS.length) listingIndex = 0; // loop around if needed
      
      const l = LISTINGS[listingIndex];
      listingIndex++;
      
      console.log(`Creating: ${l.title} in ${city} for ${ownerEmail}`);
      try {
        await createListing(token, l, city);
      } catch(err) {
        console.error(`Failed to create ${l.title}:`, err.response?.data || err.message);
      }
      await delay(500); // polite delay
    }
  }

  console.log("All listings created! Approving them...");
  await approveListings();
  console.log("Marketplace successfully populated!");
}

main().catch(console.error);
