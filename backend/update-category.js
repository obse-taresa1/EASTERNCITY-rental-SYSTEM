const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find the Baby & Kids category
  let babyCategory = await prisma.category.findUnique({
    where: { slug: 'baby-kids' }
  });

  if (!babyCategory) {
    console.log('Baby & Kids category not found, checking if Cultural Wedding Dress exists...');
    babyCategory = await prisma.category.findFirst({
      where: { slug: 'cultural-wedding-dress' }
    });
  }

  let targetCategory;

  if (babyCategory && babyCategory.slug === 'baby-kids') {
    // 2. Update it to Cultural Wedding Dress
    console.log('Updating Baby & Kids category...');
    targetCategory = await prisma.category.update({
      where: { id: babyCategory.id },
      data: {
        name: 'Cultural Wedding Dress',
        slug: 'cultural-wedding-dress',
        description: 'Traditional and cultural wedding dresses, outfits, and accessories.'
      }
    });
  } else if (babyCategory && babyCategory.slug === 'cultural-wedding-dress') {
    targetCategory = babyCategory;
  } else {
    // Create it if it somehow doesn't exist
    targetCategory = await prisma.category.create({
      data: {
        name: 'Cultural Wedding Dress',
        slug: 'cultural-wedding-dress',
        description: 'Traditional and cultural wedding dresses, outfits, and accessories.'
      }
    });
  }

  console.log('Target Category ID:', targetCategory.id);

  // 3. Move the Harari Wedding Dress listing to this new category
  const listing = await prisma.listing.findFirst({
    where: { title: 'Harari Wedding Dress' }
  });

  if (listing) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { categoryId: targetCategory.id }
    });
    console.log('Moved Harari Wedding Dress listing to Cultural Wedding Dress category.');
  } else {
    console.log('Harari Wedding Dress listing not found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
