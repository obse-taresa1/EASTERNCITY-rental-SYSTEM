const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const listings = await p.listing.findMany({ select: { id: true, title: true, city: true, location: true } });
    const cities = new Set(listings.map(l => l.city));
    const locations = new Set(listings.map(l => l.location));
    console.log('Cities:', Array.from(cities));
    console.log('Locations:', Array.from(locations));
    console.log('Listings:');
    for (const l of listings) {
      console.log(`- [${l.id}] ${l.title}: ${l.city} / ${l.location}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
main();
