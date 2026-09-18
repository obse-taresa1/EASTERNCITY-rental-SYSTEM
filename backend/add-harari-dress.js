const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addHarariDress() {
  const rahma = await prisma.user.findFirst({ where: { email: 'rahma@example.com' } });
  
  // Find or create Cultural Wedding Dress category
  let category = await prisma.category.findUnique({ where: { slug: 'cultural-wedding-dress' } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Cultural Wedding Dress',
        slug: 'cultural-wedding-dress',
        description: 'Traditional and cultural wedding dresses, outfits, and accessories.'
      }
    });
  }

  // Create the listing
  const listing = await prisma.listing.create({
    data: {
      title: 'Harari Wedding Dress',
      description: 'Stunning Harari wedding dress for rent. Perfect for traditional ceremonies and celebrations.',
      pricePerDay: 8000,
      city: 'Jigjiga',
      status: 'PUBLISHED',
      owner: { connect: { id: rahma.id } },
      category: { connect: { id: category.id } },
      images: {
        create: [
          { imageUrl: '/uploads/listings/final/harari-dress/1.png', sortOrder: 0 },
          { imageUrl: '/uploads/listings/final/harari-dress/2.jpg', sortOrder: 1 }
        ]
      }
    }
  });

  console.log('Successfully created Harari Wedding Dress!', listing.id);
}

addHarariDress()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
