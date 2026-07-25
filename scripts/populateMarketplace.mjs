import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FormData, File } from 'formdata-node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api';

const ADMIN_EMAIL = 'rahmasala663@gmail.com';
const ADMIN_PASSWORD = 'rrrrrr';

// We will use axios instances for session management
const createClient = (token = null) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

const DUMMY_DOMAINS = ['mail.tm', 'gmail.com'];
const CITIES = ['Harar', 'Dire Dawa', 'Jigjiga'];
const CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'electronics-cameras', name: 'Electronics' },
  { id: 'construction-diy', name: 'Construction' },
  { id: 'events', name: 'Events' },
  { id: 'furniture', name: 'Home' },
  { id: 'sports-outdoor', name: 'Sports' },
];

const NAMES = [
  'Ahmed Ali', 'Mohamed Hassan', 'Abdi Yusuf', 'Mustafe Ibrahim', 'Abdulahi Omar',
  'Yosef Alemu', 'Samuel Bekele', 'Daniel Tesfaye', 'Henok Girma', 'Dawit Solomon',
  'Natnael Haile', 'Elias Tadesse', 'Bereket Assefa', 'Mekonnen Alemu', 'Abel Desta',
  'Amina Hassan', 'Hawa Ibrahim', 'Rahma Omar', 'Fadumo Ali', 'Nasteha Mohamed',
  'Sara Yonas', 'Hana Tesfaye', 'Rahel Bekele', 'Bethlehem Desta', 'Ruth Solomon',
  'Selamawit Haile', 'Meron Girma', 'Lidia Tadesse', 'Saron Assefa', 'Martha Alemu'
];

const UNIQUE_TEMPLATES = [
  { title: 'Toyota RAV4 2023', categorySlug: 'vehicles', price: 8500, desc: 'Premium SUV for city and off-road trips. AC, Bluetooth.', images: ['toyota_rav4_2023_1781969002285.png', 'Toyota RAV4.jpg'] },
  { title: 'Mini Cooper', categorySlug: 'vehicles', price: 5000, desc: 'Compact and stylish. Great for city parking and daily commutes.', images: ['vehcooper.png', 'vehcooper.png'] },
  { title: 'Ford Explorer', categorySlug: 'vehicles', price: 7500, desc: 'Spacious family SUV with 3rd-row seating and modern tech.', images: ['vehford.png', 'vehford.png'] },
  { title: 'Honda Civic', categorySlug: 'vehicles', price: 4000, desc: 'Reliable and fuel-efficient sedan for long trips.', images: ['vehhonda.png', 'vehhonda.png'] },
  { title: 'Luxury SUV', categorySlug: 'vehicles', price: 9000, desc: 'High-end SUV for VIP transport and special events.', images: ['vehsvu.png', 'vehsvu.png'] },
  { title: 'Gaming Laptop RTX 3060', categorySlug: 'electronics-cameras', price: 4500, desc: 'High-end gaming laptop. 16GB RAM, 1TB SSD.', images: ['gaming_laptop_1781969037627.png', 'gaming_laptop_1781969037627.png'] },
  { title: 'Desktop PC Core i7', categorySlug: 'electronics-cameras', price: 3000, desc: 'Powerful desktop PC for office work or video editing.', images: ['pc.png', 'pc.png'] },
  { title: 'Canon DSLR Camera', categorySlug: 'electronics-cameras', price: 2800, desc: 'Professional DSLR camera for events and portraits.', images: ['canon.png', 'canon.png'] },
  { title: 'Canon Professional Kit', categorySlug: 'electronics-cameras', price: 3500, desc: 'Full Canon kit including lenses and tripod.', images: ['canon_dslr_kit_1781969013603.png', 'canon_dslr_kit_1781969013603.png'] },
  { title: 'Sony Alpha 4K', categorySlug: 'electronics-cameras', price: 4000, desc: 'Mirrorless camera perfect for cinematic videography.', images: ['catagsony.png', 'catagsony4k.png'] },
  { title: 'VR Headset', categorySlug: 'electronics-cameras', price: 1500, desc: 'Immersive VR headset for gaming and events.', images: ['electroheadset.png', 'electroheadset.png'] },
  { title: 'Bluetooth Speaker Set', categorySlug: 'electronics-cameras', price: 800, desc: 'Loud and clear portable speaker for small parties.', images: ['electrospkear.png', 'electrospkear.png'] },
  { title: 'Smart TV 65"', categorySlug: 'electronics-cameras', price: 2000, desc: 'Large 4K Smart TV for presentations or home cinema.', images: ['electrotv.png', 'electrotv.png'] },
  { title: 'DeWalt Power Drill', categorySlug: 'construction-diy', price: 700, desc: 'Heavy duty power drill with multiple bits.', images: ['dewalt.png', 'dewalt.png'] },
  { title: 'DeWalt Drill Set', categorySlug: 'construction-diy', price: 1000, desc: 'Complete drill and toolkit for contractors.', images: ['dewalt_drill_set_1781969024967.png', 'dewalt_drill_set_1781969024967.png'] },
  { title: 'Lawn Mower', categorySlug: 'construction-diy', price: 1200, desc: 'Gas powered lawn mower for landscaping jobs.', images: ['toollaw.png', 'toollaw.png'] },
  { title: 'Orbital Sander', categorySlug: 'construction-diy', price: 500, desc: 'Professional wood sander for carpentry.', images: ['toolorbit.png', 'toolorbit.png'] },
  { title: 'Circular Saw', categorySlug: 'construction-diy', price: 600, desc: 'High RPM circular saw with extra blades.', images: ['toolsaw.png', 'toolsaw.png'] },
  { title: 'Pressure Washer', categorySlug: 'construction-diy', price: 1100, desc: 'High power pressure washer for deep cleaning.', images: ['pressure_washer_1781969060604.png', 'pressure_washer_1781969060604.png'] },
  { title: '4K Projector', categorySlug: 'events', price: 2500, desc: 'Ultra HD projector for weddings and corporate events.', images: ['4k_projector_1781969048940.png', '4k_projector_1781969048940.png'] },
  { title: 'Standard Projector', categorySlug: 'events', price: 1000, desc: 'HD projector for office meetings and small events.', images: ['projector.png', 'projector.png'] },
  { title: 'Water Pump', categorySlug: 'construction-diy', price: 800, desc: 'Heavy duty water pump for construction sites.', images: ['waterpp.png', 'waterpp.png'] },
  { title: 'Modern Sofa Set', categorySlug: 'furniture', price: 1500, desc: 'Comfortable 5-seater sofa set for events or temporary housing.', images: ['furnsofa.png', 'furnsofa.png'] },
  { title: 'Ergonomic Chair', categorySlug: 'furniture', price: 300, desc: 'Comfortable office chair with lumbar support.', images: ['furnchair.png', 'furnchair.png'] },
  { title: 'Office Desk', categorySlug: 'furniture', price: 600, desc: 'Spacious wooden desk for remote work setups.', images: ['furndesk.png', 'furndesk.png'] },
  { title: 'Dining Table', categorySlug: 'furniture', price: 1000, desc: 'Large 6-seater dining table, perfect for dinner parties.', images: ['furndinning.png', 'furndinning.png'] },
  { title: 'Bookshelf', categorySlug: 'furniture', price: 400, desc: 'Tall wooden bookshelf for home staging.', images: ['furnshelf.png', 'furnshelf.png'] },
  { title: 'Mountain Bike', categorySlug: 'sports-outdoor', price: 900, desc: 'Durable mountain bike for off-road trails.', images: ['sportbick.png', 'sportbick.png'] },
  { title: 'Climbing Gear', categorySlug: 'sports-outdoor', price: 1200, desc: 'Full set of harnesses and ropes for rock climbing.', images: ['sportclim.png', 'sportclim.png'] },
  { title: 'Golf Club Set', categorySlug: 'sports-outdoor', price: 2000, desc: 'Premium golf clubs with carrying bag.', images: ['sportgolf.png', 'sportgolf.png'] },
  { title: 'Kayak', categorySlug: 'sports-outdoor', price: 1500, desc: 'Two-person kayak with paddles and life jackets.', images: ['sportkeay.png', 'sportkeay.png'] },
  { title: 'Paddleboard', categorySlug: 'sports-outdoor', price: 800, desc: 'Stand-up paddleboard, great for lakes.', images: ['sportpandel.png', 'sportpandel.png'] }
];

const ASSETS_DIR = path.join(__dirname, '../frontend/src/assets/images');

let templateIndex = 0;
function getNextTemplate() {
  const t = UNIQUE_TEMPLATES[templateIndex % UNIQUE_TEMPLATES.length];
  templateIndex++;
  return t;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  console.log('Starting population script...');

  // 1. Admin Login
  const adminClient = createClient();
  let adminToken;
  try {
    const loginRes = await adminClient.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    adminToken = loginRes.data.data.token || loginRes.data.data.accessToken;
    adminClient.defaults.headers['Authorization'] = `Bearer ${adminToken}`;
    console.log('✅ Admin login successful');
  } catch (err) {
    console.error('❌ Admin login failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 2. Delete All Existing Listings
  try {
    const manageRes = await adminClient.get('/listings/manage');
    const listings = manageRes.data.data;
    let deletedCount = 0;
    for (const listing of listings) {
      await adminClient.delete(`/listings/${listing.id}`);
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} previous listings`);
  } catch (err) {
    console.error('❌ Failed to fetch/delete listings:', err.response?.data || err.message);
  }

  // 3. Create Owners & Listings
  let totalOwners = 0;
  let totalListings = 0;

  // Use a generic placeholder for IDs and proof
  const dummyProof = path.join(ASSETS_DIR, 'logo.png');

  // Shuffle names to pick 15
  const selectedNames = [...NAMES].sort(() => 0.5 - Math.random()).slice(0, 15);

  const report = [];

  for (const name of selectedNames) {
    const email = `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@${DUMMY_DOMAINS[0]}`;
    const password = 'Password123!';
    const city = randomItem(CITIES);
    
    // Register User
    const userClient = createClient();
    let userToken;
    try {
      const regRes = await userClient.post('/auth/register', {
        name,
        email,
        password,
      });
      userToken = regRes.data.data.token || regRes.data.data.accessToken;
      userClient.defaults.headers['Authorization'] = `Bearer ${userToken}`;
      totalOwners++;
      console.log(`✅ Registered owner: ${name} (${city})`);
    } catch (err) {
      console.error(`❌ Registration failed for ${name}:`, err.response?.data || err.message);
      continue;
    }

    // Create 1-3 Listings
    const listingsToCreate = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < listingsToCreate; i++) {
      const template = getNextTemplate();
      
      const form = new FormData();
      form.append('title', template.title);
      form.append('description', template.desc);
      form.append('categorySlug', template.categorySlug);
      form.append('city', city);
      form.append('location', `${randomItem(['Downtown', 'Market Area', 'Main Road'])}, ${city}`);
      form.append('pricePerDay', String(template.price));
      form.append('status', 'PENDING');
      form.append('paymentMethod', 'Telebirr');
      form.append('paymentStatus', 'PENDING');

      // Add template specific images
      for (let j = 0; j < 3; j++) {
        // Fallback to the first image if template has less than 3
        const imgName = template.images[j] || template.images[0];
        const imgPath = path.join(ASSETS_DIR, imgName);
        const buffer = fs.readFileSync(imgPath);
        form.append('images', new File([buffer], `image${j}.jpg`, { type: 'image/jpeg' }));
      }
      const proofBuffer = fs.readFileSync(dummyProof);
      form.append('paymentProof', new File([proofBuffer], 'proof.jpg', { type: 'image/jpeg' }));

      try {
        const createRes = await userClient.post('/listings', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newListing = createRes.data.data;
        
        // Admin Approves Listing
        await adminClient.patch(`/listings/${newListing.id}/approve`);
        totalListings++;
        console.log(`   ✅ Created and approved listing: ${template.title}`);
      } catch (err) {
        console.error(`   ❌ Failed to create listing:`, err.response?.data || err.message);
      }
    }

    report.push({
      Owner: name,
      Email: email,
      Password: password,
      City: city,
      ListingsCreated: listingsToCreate
    });
  }

  console.log('\n=============================================');
  console.log('🎉 Population Complete!');
  console.log(`Total Owners: ${totalOwners}`);
  console.log(`Total Listings Approved: ${totalListings}`);
  console.table(report);
  console.log('=============================================');
}

run();
