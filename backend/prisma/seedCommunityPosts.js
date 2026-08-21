const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const rahma = users.find(u => u.email === 'rahmasala763@gmail.com');
  if (!rahma) throw new Error('Rahma user not found');
  const others = users.filter(u => u.email !== 'rahmasala763@gmail.com');
  if (others.length === 0) throw new Error('Need at least one other user');

  const categories = [
    'LOOKING_FOR_ITEM',
    'OFFERING_RENTAL',
    'EQUIPMENT_NEEDED',
    'EVENT_PLANNING',
    'RECOMMENDATION',
    'LOST_FOUND',
    'EMERGENCY_REQUEST',
  ];

  const realisticCities = ['Jigjiga', 'Dire Dawa', 'Harar'];

  // Clear existing community posts to ensure clean seed
  await prisma.media.deleteMany({ where: { postId: { not: null } } });
  await prisma.communityPost.deleteMany({});
  
  let rahmaCount = 0;
  let total = 0;

  for (const cat of categories) {
    for (let i = 1; i <= 3; i++) {
      const hasImage = i <= 2;
      let authorId;
      
      if (rahmaCount < 2 && i === 1 && (cat === 'LOOKING_FOR_ITEM' || cat === 'EMERGENCY_REQUEST')) {
        authorId = rahma.id;
        rahmaCount++;
      } else {
        authorId = others[total % others.length].id;
      }

      const city = realisticCities[total % realisticCities.length];
      
      const humanReadableCat = cat.replace(/_/g, ' ').toLowerCase();
      const title = `Need help with ${humanReadableCat} in ${city}`;
      const description = `Hello community! I am currently dealing with a situation requiring a ${humanReadableCat}. I am located near the center of ${city} and would appreciate any leads, advice, or direct assistance from anyone available. Thank you in advance!`;

      const data = {
        type: 'COMMUNITY_FEED',
        title,
        description,
        category: cat,
        city,
        authorId,
        status: 'PENDING',
      };
      
      if (hasImage) {
        data.media = {
          create: [{
            type: 'IMAGE',
            url: `https://loremflickr.com/600/400/${humanReadableCat.split(' ')[0]}?lock=${total}`
          }]
        };
      }
      
      await prisma.communityPost.create({ data });
      total++;
    }
  }
  console.log(`Seeded ${total} community posts (${rahmaCount} by ${rahma.email}).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
