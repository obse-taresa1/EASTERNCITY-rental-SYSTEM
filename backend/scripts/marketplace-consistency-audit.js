require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.listing.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(
    JSON.stringify(
      {
        count: listings.length,
        listings: listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category && {
            id: listing.category.id,
            name: listing.category.name,
            slug: listing.category.slug,
          },
          status: listing.status,
          city: listing.city,
          location: listing.location,
          pricePerDay: Number(listing.pricePerDay),
          owner: listing.owner,
          images: listing.images.map((image) => ({
            id: image.id,
            url: image.imageUrl,
            sortOrder: image.sortOrder,
          })),
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
