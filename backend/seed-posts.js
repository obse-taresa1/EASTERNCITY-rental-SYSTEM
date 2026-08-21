const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found in DB. Cannot create posts.");
    return;
  }
  
  // Find posts to delete
  const postsToDelete = await prisma.communityPost.findMany({
    where: {
      title: {
        in: [
          'Emergency: Need a heavy generator immediately!',
          'Looking for a vintage DSLR camera',
          'Urgent: Medical transport vehicle needed',
          'Urgent: Need water pump for flooded basement',
          'Urgent: Need a Heavy Duty Tractor'
        ]
      }
    }
  });

  const postIds = postsToDelete.map(p => p.id);

  if (postIds.length > 0) {
    await prisma.media.deleteMany({
      where: { postId: { in: postIds } }
    });
    await prisma.communityPost.deleteMany({
      where: { id: { in: postIds } }
    });
  }

  // Create Rentable Emergency Request (Tractor)
  await prisma.communityPost.create({
    data: {
      type: 'RENTAL_REQUEST',
      title: 'Urgent: Need a Heavy Duty Tractor',
      description: 'Need to rent a heavy duty tractor immediately for an urgent farming situation in Jigjiga. Will pay premium daily rate.',
      category: 'EMERGENCY_REQUEST',
      city: 'Jigjiga',
      status: 'APPROVED',
      authorId: user.id,
      media: {
        create: [
          { type: 'IMAGE', url: 'https://images.unsplash.com/photo-1592982537447-6f296d9b32cb' } // tractor
        ]
      }
    }
  });

  // Create Looking For Item (Camera with DIFFERENT image that definitely works)
  await prisma.communityPost.create({
    data: {
      type: 'RENTAL_REQUEST',
      title: 'Looking for a vintage DSLR camera',
      description: 'I need a working film or vintage DSLR camera for a weekend photography project.',
      category: 'LOOKING_FOR_ITEM',
      city: 'Harar',
      status: 'APPROVED',
      authorId: user.id,
      media: {
        create: [
          // Using a very reliable placeholder image service for the camera
          { type: 'IMAGE', url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800' }
        ]
      }
    }
  });
  
  console.log("Successfully re-seeded with the requested updates.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
