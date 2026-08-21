const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

if (process.env.ALLOW_DESTRUCTIVE_MARKETPLACE_RESET !== 'true') {
  console.error('This legacy reset script is disabled. It would delete listings, bookings, reviews, promotions, and messages. Use Prisma migrations and verify-marketplace-data.js instead.');
  process.exit(1);
}

async function migrate() {
  console.log('Starting migration...');

  try {
    // 1. Update emails
    const emailUpdates = [
      'eliastadesse681', 'marthaalemu824', 'saronassefa223', 'hawaibrahim744', 
      'bethlehemdesta950', 'hanatesfaye52', 'sarayonas23', 'ahmedali634', 
      'ruthsolomon653', 'mustafeibrahim652', 'dawitsolomon431', 'mohamedhassan208', 
      'fadumoali917', 'merongirma665', 'lidiatadesse202'
    ];

    console.log('Updating emails...');
    for (const prefix of emailUpdates) {
      const oldEmail = `${prefix}@mail.tm`;
      const newEmail = `${prefix}@gmail.com`;
      
      const user = await prisma.user.findUnique({ where: { email: oldEmail } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: newEmail }
        });
        console.log(`Updated ${oldEmail} to ${newEmail}`);
      }
    }

    // 2. Clear old mock data (Promotions, Reviews, Bookings, Conversations, Messages, Listings)
    console.log('Clearing old listings and related data...');
    await prisma.promotion.deleteMany();
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.listingImage.deleteMany();
    await prisma.listing.deleteMany();

    // 3. Insert realistic data
    console.log('Fetching users and categories for realistic data...');
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    if (users.length === 0) {
      console.log('No users found to assign listings to.');
      return;
    }

    const categories = await prisma.category.findMany();
    const getCatId = (slug) => {
      const cat = categories.find(c => c.slug === slug);
      return cat ? cat.id : categories[0].id; // fallback
    };

    const getRandomUser = () => users[Math.floor(Math.random() * users.length)].id;

    const realisticListings = [
      // Vehicles
      {
        title: 'Toyota Corolla 2018',
        description: 'Well-maintained automatic Toyota Corolla. Perfect for city driving or trips to nearby towns. Air conditioned, clean interior.',
        pricePerDay: 1500,
        city: 'Dire Dawa',
        location: 'Kezira, Dire Dawa',
        categorySlug: 'cars-bikes'
      },
      {
        title: 'Hyundai Tucson SUV',
        description: 'Spacious and comfortable SUV for family trips. Features 4WD, perfect for trips around Harar and Jigjiga.',
        pricePerDay: 2500,
        city: 'Harar',
        location: 'Arategna, Harar',
        categorySlug: 'cars-bikes'
      },
      // Construction/Tools
      {
        title: 'Heavy Duty Concrete Mixer',
        description: 'Diesel powered concrete mixer in excellent condition. Daily rental includes delivery within Jigjiga.',
        pricePerDay: 800,
        city: 'Jigjiga',
        location: 'Taiwan Market Area, Jigjiga',
        categorySlug: 'construction-diy'
      },
      {
        title: 'Bosch Power Drill Set',
        description: 'Complete professional Bosch drill set with all bits included. Ideal for home DIY projects.',
        pricePerDay: 200,
        city: 'Dire Dawa',
        location: 'Megala, Dire Dawa',
        categorySlug: 'construction-diy'
      },
      // Electronics
      {
        title: 'Canon EOS 90D DSLR Camera',
        description: 'Professional DSLR camera perfect for weddings and events. Includes two lenses (50mm and 18-135mm) and a tripod.',
        pricePerDay: 600,
        city: 'Harar',
        location: 'Piassa, Harar',
        categorySlug: 'electronics-cameras'
      },
      {
        title: 'Sony PlayStation 5',
        description: 'PS5 console with 2 dual sense controllers and 4 popular games (FIFA 23, GTA V included).',
        pricePerDay: 400,
        city: 'Jigjiga',
        location: 'Kebele 04, Jigjiga',
        categorySlug: 'gadgets'
      },
      // Party/Events
      {
        title: 'Large Event Tent (500 capacity)',
        description: 'Waterproof white event tent perfect for weddings and large gatherings. We provide setup and teardown.',
        pricePerDay: 5000,
        city: 'Dire Dawa',
        location: 'Sabian, Dire Dawa',
        categorySlug: 'party-wedding'
      },
      {
        title: 'JBL Professional Sound System',
        description: 'Two massive JBL speakers with a mixer and two wireless microphones. Loud enough for outdoor events.',
        pricePerDay: 1200,
        city: 'Harar',
        location: 'Shenkor, Harar',
        categorySlug: 'party-wedding'
      },
      {
        title: 'Plastic Chairs (Set of 100)',
        description: 'Clean, sturdy plastic chairs for any event. Price is for a set of 100 chairs per day.',
        pricePerDay: 500,
        city: 'Jigjiga',
        location: 'Kebele 06, Jigjiga',
        categorySlug: 'party-wedding'
      }
    ];

    console.log('Inserting realistic listings...');
    for (const data of realisticListings) {
      await prisma.listing.create({
        data: {
          title: data.title,
          description: data.description,
          pricePerDay: data.pricePerDay,
          city: data.city,
          location: data.location,
          status: 'APPROVED',
          ownerId: getRandomUser(),
          categoryId: getCatId(data.categorySlug)
        }
      });
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
