const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

const cityMapping = {
  'Adama': 'Dire Dawa',
  'Addis Ababa': 'Harar',
  'Bahir Dar': 'Jigjiga',
  'Hawassa': 'Dire Dawa'
};

const defaultSefar = {
  'Jigjiga': 'Suuq Madow (Kebele 01)',
  'Dire Dawa': 'Kezira',
  'Harar': 'Jugol'
};

const validSefars = new Set([
  "Sheikh Nur-Ise (Ise Kela)", "Suuq Madow (Kebele 01)", "Taiwan Sefer", "Garab'ase", "Dullaad", "Gende Biyo", "Hoolada (Kebele 06)",
  "Kezira", "Ashewa", "Megala", "Taiwan Market", "Sabian", "Gende Qorii", "Gende Tesfa",
  "Arategna", "Jugol", "Shenkor", "Kazanchis", "Werwari", "Bate", "Botanic"
]);

async function main() {
  try {
    const listings = await p.listing.findMany();
    for (const l of listings) {
      let newCity = l.city;
      if (cityMapping[l.city]) {
        newCity = cityMapping[l.city];
      }
      
      let newLocation = l.location;
      if (!validSefars.has(l.location) || l.city !== newCity) {
        newLocation = defaultSefar[newCity];
      }
      
      if (newCity !== l.city || newLocation !== l.location) {
        await p.listing.update({
          where: { id: l.id },
          data: { city: newCity, location: newLocation }
        });
        console.log(`Updated [${l.id}] from ${l.city} / ${l.location} to ${newCity} / ${newLocation}`);
      }
    }
    console.log('Update complete.');
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
main();
