const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(str) {
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

(async () => {
  try {
    const listings = await prisma.listing.findMany({ select: { id: true, title: true } });
    const toProcess = [];

    for (const lst of listings) {
      const imgs = await prisma.listingImage.findMany({
        where: { listingId: lst.id },
        select: { imageUrl: true }
      });
      const hasPlaceholder = imgs.some(i => i.imageUrl.includes('placeholder'));
      const hasNoImages = imgs.length === 0;
      const allSame = imgs.length > 1 && new Set(imgs.map(i => i.imageUrl)).size === 1;
      
      if (hasPlaceholder || hasNoImages || allSame) {
        toProcess.push(lst);
      }
    }

    console.log(`Found ${toProcess.length} listings needing images.`);
    
    for (const { id, title } of toProcess) {
      // Delete existing placeholder images
      await prisma.listingImage.deleteMany({ where: { listingId: id } });

      const angles = ['front view', 'side profile', 'rear view', 'closeup detail'];
      
      for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
        // Create a predictable seed based on the title and angle so it doesn't change on every page load
        const seed = Math.abs(title.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) + i;
        
        const prompt = encodeURIComponent(`${title} ${angle} product photography, white background, highly detailed, realistic`);
        // Use direct URL. The user's browser will fetch this.
        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?seed=${seed}&width=800&height=800&nologo=true`;
        
        await prisma.listingImage.create({
          data: {
            listingId: id,
            imageUrl: imageUrl,
            sortOrder: i + 1
          }
        });
      }
      console.log(`✅ Assigned Pollinations URLs for "${title}"`);
    }

    console.log(`\n✅ Successfully updated ${toProcess.length} listings with direct image URLs!`);
  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
