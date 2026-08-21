const { PrismaClient } = require("@prisma/client");

const listingId = process.argv[2];

if (!listingId) {
  throw new Error("Usage: node scripts/inspect-live-listing.js <listing-id>");
}

const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!listing) throw new Error(`Listing ${listingId} was not found.`);

  console.log(JSON.stringify({
    id: listing.id,
    title: listing.title,
    category: listing.category?.name ?? null,
    images: listing.images.map(({ id, imageUrl, sortOrder }) => ({ id, imageUrl, sortOrder })),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
