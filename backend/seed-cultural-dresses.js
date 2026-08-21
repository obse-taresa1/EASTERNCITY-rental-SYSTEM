const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get the Cultural Wedding Dress category
  const category = await prisma.category.findFirst({
    where: { slug: 'cultural-wedding-dress' }
  });

  if (!category) {
    console.log('Cultural Wedding Dress category not found!');
    return;
  }

  console.log('Category found:', category.name, category.id);

  // Get existing users to assign as owners
  const owners = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true },
    take: 3
  });

  if (!owners.length) {
    console.log('No users found!');
    return;
  }

  const cities = ['Jigjiga', 'Harar', 'Dire Dawa'];

  const listings = [
    {
      title: 'Somali Dress',
      description: 'Stunning traditional Somali wedding dress with elegant gold embroidery and veil. Perfect for weddings and cultural ceremonies.',
      price: 5000,
      city: 'Jigjiga',
      location: 'Suuq Madow (Kebele 01)',
      images: [
        '/uploads/listings/final/somali-dress/1.jpg',
        '/uploads/listings/final/somali-dress/2.png'
      ]
    },
    {
      title: 'Mels Dress',
      description: 'Beautiful traditional white Mels dress with decorative embroidery and accessories. Ideal for cultural ceremonies and celebrations.',
      price: 4500,
      city: 'Harar',
      location: 'Old Town, Harar',
      images: [
        '/uploads/listings/final/mels-dress/1.jpg'
      ]
    },
    {
      title: 'Sadeta Harage Dress',
      description: 'Authentic Sadeta Harage traditional dress with iconic headdress and jewelry. A rare cultural outfit for special occasions.',
      price: 6000,
      city: 'Harar',
      location: 'Jugol, Old Town Harar',
      images: [
        '/uploads/listings/final/sadeta-harage-dress/1.jpg',
        '/uploads/listings/final/sadeta-harage-dress/2.jpg'
      ]
    }
  ];

  // Find existing items to replace OR create new ones
  const existingFashion = await prisma.listing.findMany({
    where: {
      category: { slug: { in: ['fashion-accessories', 'cultural-wedding-dress'] } },
      title: { in: ['Evening Dress', 'Traditional Wedding Outfit', 'Somali Dress', 'Mels Dress', 'Sadeta Harage Dress'] }
    },
    select: { id: true, title: true }
  });

  console.log('Existing items to potentially replace:', existingFashion.map(e => e.title));

  for (let i = 0; i < listings.length; i++) {
    const data = listings[i];
    const owner = owners[i % owners.length];

    // Check if already exists
    const existing = await prisma.listing.findFirst({
      where: { title: data.title }
    });

    let listingId;
    if (existing) {
      // Update existing
      await prisma.listing.update({
        where: { id: existing.id },
        data: {
          categoryId: category.id,
          pricePerDay: data.price,
          description: data.description,
          city: data.city,
          location: data.location,
          status: 'APPROVED'
        }
      });
      listingId = existing.id;
      console.log(`Updated: ${data.title}`);
    } else {
      // Create new
      const listing = await prisma.listing.create({
        data: {
          title: data.title,
          description: data.description,
          ownerId: owner.id,
          categoryId: category.id,
          city: data.city,
          location: data.location,
          pricePerDay: data.price,
          status: 'APPROVED',
          approvedAt: new Date(),
          paymentStatus: 'PAID'
        }
      });
      listingId = listing.id;
      console.log(`Created: ${data.title}`);
    }

    // Replace images
    await prisma.listingImage.deleteMany({ where: { listingId } });
    await prisma.listingImage.createMany({
      data: data.images.map((url, idx) => ({
        listingId,
        imageUrl: url,
        sortOrder: idx
      }))
    });
    console.log(`  -> Images set for ${data.title}`);
  }

  console.log('\nAll done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
