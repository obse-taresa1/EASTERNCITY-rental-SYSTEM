const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IMAGE_MAPPING = {
  // Cars & Bikes
  'Toyota Corolla': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop', // Corolla sedan
  'Toyota RAV4': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=1200&auto=format&fit=crop', // SUV
  'Honda Civic': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop',
  
  // Electronics
  'Gaming Laptop': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop',
  'MacBook Pro': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
  'Projector': 'https://images.unsplash.com/photo-1579566946654-20ce6dc27b7c?q=80&w=1200&auto=format&fit=crop',
  'iPad Pro': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop',
  
  // Photography
  'Canon DSLR Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
  'DSLR Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
  'Sony Mirrorless Camera': 'https://images.unsplash.com/photo-1617005082833-1eb5857038e5?q=80&w=1200&auto=format&fit=crop',
  'Camera Lens': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop',

  // Construction & Tools
  'Concrete Mixer': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
  'Generator': 'https://images.unsplash.com/photo-1616781296065-388277a94ff6?q=80&w=1200&auto=format&fit=crop',
  'DeWalt Drill Set': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop',
  'Power Drill': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop',
  'Ladders': 'https://images.unsplash.com/photo-1515222097223-1d8985cb9664?q=80&w=1200&auto=format&fit=crop',

  // Events & Party
  'Wedding Tent': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  'Plastic Chairs': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
  'Wedding Chairs (Set of 50)': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
  'Folding Tables': 'https://images.unsplash.com/photo-1530605963955-46ebcd5105e6?q=80&w=1200&auto=format&fit=crop',

  // Furniture
  'Modern Sectional Sofa': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop',
  'Office Desk': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200&auto=format&fit=crop',
  'Dining Table': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=1200&auto=format&fit=crop',
  
  // Home Appliances
  'Refrigerator': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop',
  'Washing Machine': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1200&auto=format&fit=crop',
  'Air Conditioner': 'https://images.unsplash.com/photo-1565538195861-c062c3e414c1?q=80&w=1200&auto=format&fit=crop',

  // Sports & Outdoor
  'Mountain Bike Pro': 'https://images.unsplash.com/photo-1576435728678-68ce0f622472?q=80&w=1200&auto=format&fit=crop',
  'Mountain Bike': 'https://images.unsplash.com/photo-1576435728678-68ce0f622472?q=80&w=1200&auto=format&fit=crop',
  'Camping Tent': 'https://images.unsplash.com/photo-1504280387937-31f47847c234?q=80&w=1200&auto=format&fit=crop',
  
  // Others / Defaults
  'Nail Set': 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=1200&auto=format&fit=crop',
};

// Fallback images based on category
const FALLBACK_CATEGORY_IMAGES = {
  'cars-bikes': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  'vehicles': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  'electronics-cameras': 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
  'cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
  'gadgets': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
  'construction-diy': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop',
  'tools': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'events': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  'party-wedding': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  'party': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
  'furniture': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop',
  'home-appliances': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop',
  'sports-outdoor': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
  'sports': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop'
};

async function fixListingImages() {
  const listings = await prisma.listing.findMany({
    include: {
      category: true,
      images: true
    }
  });

  let fixedCount = 0;

  for (const listing of listings) {
    let bestImage = null;

    // Check title match first
    for (const [title, url] of Object.entries(IMAGE_MAPPING)) {
      if (listing.title.toLowerCase().includes(title.toLowerCase())) {
        bestImage = url;
        break;
      }
    }

    // Fallback to category match
    if (!bestImage && listing.category && listing.category.slug) {
       bestImage = FALLBACK_CATEGORY_IMAGES[listing.category.slug];
    }
    
    // Check if current image is wrong (if we have a better matching image)
    // We update if we found a highly specific image, OR if the current image seems wrong for the category.
    if (bestImage) {
        let currentImage = listing.images && listing.images.length > 0 ? listing.images[0].imageUrl : null;
        
        // Let's just always enforce our bestImage mapping so we are 100% sure it's correct.
        if (currentImage !== bestImage) {
            console.log(`Fixing image for [${listing.category?.name}] ${listing.title}`);
            console.log(`  Old: ${currentImage}`);
            console.log(`  New: ${bestImage}`);
            
            // Delete old images
            await prisma.listingImage.deleteMany({
                where: { listingId: listing.id }
            });
            
            // Create new image
            await prisma.listingImage.create({
                data: {
                    listingId: listing.id,
                    imageUrl: bestImage,
                    sortOrder: 0
                }
            });
            fixedCount++;
        }
    }
  }

  console.log(`\nFixed ${fixedCount} listings.`);
  await prisma.$disconnect();
}

fixListingImages().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
