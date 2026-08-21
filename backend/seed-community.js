/**
 * seed-community.js
 * Seeds realistic community posts for ALL supported categories.
 * Uses raw SQL via prisma.$executeRawUnsafe to bypass any Prisma enum type mismatch.
 * 3 posts per category (2 with images, 1 without).
 * rahmasala763@gmail.com used for exactly 2 posts total.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ── Find target users ──────────────────────────────────────────────────────
  const rahma = await prisma.user.findUnique({ where: { email: 'rahmasala763@gmail.com' } });
  if (!rahma) {
    console.error('ERROR: rahmasala763@gmail.com not found in the database. Please register this account first.');
    process.exit(1);
  }

  const allUsers = await prisma.user.findMany({
    where: { email: { not: 'rahmasala763@gmail.com' } },
    take: 20,
    orderBy: { createdAt: 'asc' },
  });

  if (allUsers.length < 3) {
    console.error(`ERROR: Need at least 3 other users in DB. Found ${allUsers.length}. Please seed users first.`);
    process.exit(1);
  }

  const u1 = allUsers[0];
  const u2 = allUsers[1];
  const u3 = allUsers[2];
  const u4 = allUsers[3] || u3;

  console.log(`Using rahma: ${rahma.email} (${rahma.id})`);
  console.log(`Other users: ${u1.email}, ${u2.email}, ${u3.email}, ${u4.email}`);

  // ── Post definitions ──────────────────────────────────────────────────────
  // 2 categories × 3 posts each = 6 posts total.
  // rahmasala763@gmail.com used for exactly 2 posts.
  const posts = [
    // ── LOOKING_FOR_ITEM (3 posts: 2 images, 1 no-image) ──────────────────
    {
      type: 'COMMUNITY_FEED',
      title: 'Looking for 50 Banquet Chairs for Wedding',
      description: 'I need to rent 50 white banquet chairs for a wedding ceremony this coming Saturday in Dire Dawa. Please contact me if you have them available. Delivery assistance appreciated.',
      category: 'LOOKING_FOR_ITEM',
      city: 'Dire Dawa',
      authorId: u1.id,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    },
    {
      type: 'COMMUNITY_FEED',
      title: 'Searching for a DSLR Camera Rental for 3 Days',
      description: 'Looking to rent a DSLR camera with a kit lens for a photography assignment next week in Jigjiga. Additional lenses (50mm, 85mm) are a bonus. Happy to negotiate a fair price.',
      category: 'LOOKING_FOR_ITEM',
      city: 'Jigjiga',
      authorId: rahma.id, // Rahma post #1
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    },
    {
      type: 'COMMUNITY_FEED',
      title: 'Need a Large Sound System for a Community Event',
      description: 'Looking to rent a full PA sound system (2 speakers, mixer, and microphones) for a community fundraising event this weekend in Harar. We can arrange pickup and will return everything in perfect condition.',
      category: 'LOOKING_FOR_ITEM',
      city: 'Harar',
      authorId: u2.id,
      imageUrl: null, // No image for this post
    },

    // ── EMERGENCY_REQUEST (3 posts: 2 images, 1 no-image) ──────────────────
    {
      type: 'COMMUNITY_FEED',
      title: 'Urgent: Plumber Needed for Burst Pipe',
      description: 'A pipe has burst and is flooding our store in Jigjiga near the central market. We need an emergency plumber who can come within the hour. We will pay emergency rates. Please call immediately.',
      category: 'EMERGENCY_REQUEST',
      city: 'Jigjiga',
      authorId: rahma.id, // Rahma post #2
      imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cb31422?w=800',
    },
    {
      type: 'COMMUNITY_FEED',
      title: 'Broken Down Truck — Need Emergency Towing Service',
      description: 'My delivery truck broke down on the main road outside Dire Dawa. It is a heavy vehicle (3-ton truck) and I need a towing service that can handle it. Please reply with your contact number and available time.',
      category: 'EMERGENCY_REQUEST',
      city: 'Dire Dawa',
      authorId: u3.id,
      imageUrl: 'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=800',
    },
    {
      type: 'COMMUNITY_FEED',
      title: 'Emergency Backup Generator Needed for Local Clinic',
      description: 'Our local health clinic in Harar lost power and critical medical equipment is at risk. We need an emergency backup generator (15–20 kW minimum) as soon as possible. All rental and delivery costs will be covered.',
      category: 'EMERGENCY_REQUEST',
      city: 'Harar',
      authorId: u4.id,
      imageUrl: null, // No image for this post
    },
  ];

  // ── Insert posts using raw SQL ────────────────────────────────────────────
  let rahmaPostCount = 0;
  let insertedCount = 0;

  for (const p of posts) {
    if (p.authorId === rahma.id) rahmaPostCount++;

    // Insert the post row via raw SQL to avoid Prisma enum casting issue
    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO "CommunityPost" ("type","title","description","category","city","neighbourhood","status","authorId","views","shares","savedCount","isFeatured","tags","createdAt","updatedAt")
       VALUES ($1::\"PostType\",$2,$3,$4::\"CommunityCategory\",$5,'',$6::\"PostStatus\",$7,0,0,0,false,ARRAY[]::TEXT[],NOW(),NOW())
       RETURNING "id"`,
      p.type, p.title, p.description, p.category, p.city, 'PENDING', p.authorId
    );

    const postId = result[0]?.id;
    if (!postId) {
      console.error(`Failed to insert post: ${p.title}`);
      continue;
    }

    // Insert media if image URL provided
    if (p.imageUrl) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Media" ("type","url","postId","createdAt") VALUES ('IMAGE',$1,$2,NOW())`,
        p.imageUrl, postId
      );
    }

    insertedCount++;
    console.log(`✓ [${p.category}] "${p.title}" | Author: ${p.authorId === rahma.id ? 'RAHMA' : 'other'} | Image: ${p.imageUrl ? 'YES' : 'NO'} | ID: ${postId}`);
  }

  console.log(`\n✅ Seeded ${insertedCount} community posts.`);
  console.log(`   Rahma (${rahma.email}) was used for ${rahmaPostCount} posts.`);

  // ── Verify ────────────────────────────────────────────────────────────────
  const verification = await prisma.$queryRaw`
    SELECT cp.id, cp.title, cp.category, cp.status, cp."authorId",
           u.email as "authorEmail",
           COUNT(m.id)::int as "mediaCount"
    FROM "CommunityPost" cp
    JOIN "User" u ON u.id = cp."authorId"
    LEFT JOIN "Media" m ON m."postId" = cp.id
    WHERE cp.status = 'PENDING'
    GROUP BY cp.id, cp.title, cp.category, cp.status, cp."authorId", u.email
    ORDER BY cp.id DESC
    LIMIT 10
  `;

  console.log('\n── Database Verification (PENDING posts) ──────────────────────────────────');
  verification.forEach((row) => {
    console.log(`  [${row.id}] ${row.category} | "${row.title}" | Author: ${row.authorEmail} | Media: ${row.mediaCount}`);
  });
  console.log('───────────────────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
