const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const unsplashImages = {
  'cars-bikes': [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80'
  ],
  'construction-diy': [
    'https://images.unsplash.com/photo-1504307651254-35680f356f58?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888087425-ce81dfc46928?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1538688423619-a81d3f23454b?auto=format&fit=crop&w=800&q=80'
  ],
  'electronics-cameras': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80'
  ],
  'gadgets': [
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  ],
  'party-wedding': [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80'
  ]
};

async function migrateImages() {
  console.log('Starting image repopulation...');
  
  try {
    const listings = await prisma.listing.findMany({
      include: { category: true }
    });
    
    console.log(`Found ${listings.length} listings to update.`);
    
    for (const listing of listings) {
      const categorySlug = listing.category?.slug;
      // Get images for the category, fallback to party-wedding if not found
      const imageSet = unsplashImages[categorySlug] || unsplashImages['party-wedding'];
      
      // Shuffle and pick 3 to 5 images for this listing
      const shuffled = [...imageSet].sort(() => 0.5 - Math.random());
      const numImages = Math.floor(Math.random() * 3) + 3; // 3 to 5 images
      const selectedImages = shuffled.slice(0, numImages);
      
      // Delete existing images for this listing
      await prisma.listingImage.deleteMany({
        where: { listingId: listing.id }
      });
      
      // Create new images
      for (let i = 0; i < selectedImages.length; i++) {
        await prisma.listingImage.create({
          data: {
            listingId: listing.id,
            imageUrl: selectedImages[i],
            sortOrder: i
          }
        });
      }
      
      console.log(`Updated images for listing: ${listing.title} (${selectedImages.length} images)`);
    }
    
    console.log('Image repopulation complete!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
