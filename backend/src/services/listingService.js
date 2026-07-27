const listingRepository = require("../repositories/listingRepository");
const categoryRepository = require("../repositories/categoryRepository");
const notificationService = require("./notificationService");

function ensureOwnerOrAdmin(user, listing) {
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  if (!isAdmin && listing.ownerId !== user.id) {
    const error = new Error("You do not own this listing.");
    error.statusCode = 403;
    throw error;
  }
}

function mapUploadedImages(files = []) {
  return files.map((file, index) => ({
    imageUrl: `/uploads/listings/${file.filename}`,
    sortOrder: index,
  }));
}

function getUploadedFiles(files = {}) {
  if (Array.isArray(files)) {
    return {
      images: files,
      paymentProof: [],
    };
  }

  return {
    images: files.images || [],
    paymentProof: files.paymentProof || [],
  };
}

function paymentProofPath(file) {
  return file ? `/uploads/listings/${file.filename}` : null;
}

function toListingData(listing) {
  if (!listing) return listing;

  return {
    ...listing,
    pricePerDay: Number(listing.pricePerDay),
  };
}

function normalizeQueryValue(value) {
  const normalized = String(value || "").trim();
  return normalized && normalized.toLowerCase() !== "all" ? normalized : "";
}

const rentalCategoryAliases = {
  "electronics-cameras": [
    "electronics-cameras",
    "electronics & cameras",
    "electronics and cameras",
    "electronics",
    "cameras",
    "camera",
    "phones",
    "phone",
    "laptops",
    "laptop",
    "photography-equipment",
    "photography equipment",
  ],
  "cars-bikes": [
    "cars-bikes",
    "cars & bikes",
    "cars and bikes",
    "cars",
    "car",
    "bikes",
    "bike",
    "motorcycles",
    "motorcycle",
  ],
  "party-wedding": [
    "party-wedding",
    "party & wedding",
    "party and wedding",
    "party",
    "wedding",
  ],
  "event-essentials": [
    "event-essentials",
    "event essentials",
    "event",
    "events",
    "event-equipment",
    "event equipment",
  ],
  vehicles: ["vehicles", "vehicle", "suv", "pickup", "truck", "van", "minibus"],
  gadgets: ["gadgets", "gadget"],
  "construction-diy": [
    "construction-diy",
    "construction & diy",
    "construction and diy",
    "construction",
    "diy",
    "tools",
    "tool",
    "power-tools",
    "power tools",
    "construction-tools",
    "construction tools",
  ],
  furniture: ["furniture"],
  "home-appliances": ["home-appliances", "home appliances", "appliances"],
  "sports-outdoor": [
    "sports-outdoor",
    "sports & outdoor",
    "sports and outdoor",
    "sports",
    "outdoor",
    "sports-equipment",
    "sports equipment",
    "outdoor-gear",
    "outdoor gear",
  ],
  "travel-camping": ["travel-camping", "travel & camping", "travel and camping", "travel", "camping"],
  "fashion-accessories": [
    "fashion-accessories",
    "fashion & accessories",
    "fashion and accessories",
    "fashion",
    "accessories",
  ],
  "music-audio": [
    "music-audio",
    "music & audio equipment",
    "music and audio equipment",
    "music",
    "audio",
    "audio-equipment",
    "audio equipment",
  ],
  "office-equipment": ["office-equipment", "office equipment", "office"],
  "beauty-salon": ["beauty-salon", "beauty & salon equipment", "beauty and salon equipment", "beauty", "salon"],
  "baby-kids": ["baby-kids", "baby & kids essentials", "baby and kids essentials", "baby", "kids"],
  "gaming-equipment": ["gaming-equipment", "gaming equipment", "gaming", "games"],
};

function normalizeCategoryToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryAliases(value) {
  const normalized = normalizeCategoryToken(value);
  if (!normalized) return [];

  const canonical =
    Object.entries(rentalCategoryAliases).find(([categoryId, aliases]) => {
      const tokens = [categoryId, ...aliases].map(normalizeCategoryToken);
      return tokens.includes(normalized);
    })?.[0] || normalized;

  return [
    canonical,
    ...(rentalCategoryAliases[canonical] || []),
    value,
  ].filter(Boolean);
}

function buildPublicListingWhere(query = {}) {
  const search = normalizeQueryValue(query.search || query.keyword || query.q);
  const category = normalizeQueryValue(
    query.category || query.categoryId || query.categorySlug,
  );
  const city = normalizeQueryValue(query.city);
  const sefar = normalizeQueryValue(
    query.sefar || query.sefer || query.neighborhood || query.location,
  );
  const minPrice = Number(
    query.minPrice || query.priceMin || query.minimumPrice || 0,
  );
  const maxPrice = Number(
    query.maxPrice || query.priceMax || query.maximumPrice || 0,
  );
  const condition = normalizeQueryValue(query.condition || query.itemCondition);
  const listingType = normalizeQueryValue(query.listingType || query.type);
  const propertyType = normalizeQueryValue(query.propertyType);
  const bedrooms = normalizeQueryValue(query.bedrooms || query.bedroom);
  const bathrooms = normalizeQueryValue(query.bathrooms || query.bathroom);

  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      {
        category: {
          is: { name: { contains: search, mode: "insensitive" } },
        },
      },
      {
        category: {
          is: { slug: { contains: search, mode: "insensitive" } },
        },
      },
    ];
  }

  if (category) {
    const categoryAliases = [...new Set(getCategoryAliases(category))];
    where.category = {
      is: {
        OR: [
          { id: category },
          ...categoryAliases.flatMap((value) => [
            { slug: { equals: value, mode: "insensitive" } },
            { name: { equals: value, mode: "insensitive" } },
          ]),
        ],
      },
    };
  }

  if (city) {
    where.city = { equals: city, mode: "insensitive" };
  }

  if (sefar) {
    where.location = { contains: sefar, mode: "insensitive" };
  }

  if (minPrice > 0 || maxPrice > 0) {
    where.pricePerDay = {};
    if (minPrice > 0) where.pricePerDay.gte = minPrice;
    if (maxPrice > 0) where.pricePerDay.lte = maxPrice;
  }

  const textFilters = [
    condition,
    listingType,
    propertyType,
    bedrooms ? `${bedrooms} bedroom` : "",
    bathrooms ? `${bathrooms} bathroom` : "",
  ].filter(Boolean);

  if (textFilters.length > 0) {
    where.AND = [
      ...(where.AND || []),
      ...textFilters.map((value) => ({
        OR: [
          { title: { contains: value, mode: "insensitive" } },
          { description: { contains: value, mode: "insensitive" } },
          { location: { contains: value, mode: "insensitive" } },
          {
            category: {
              is: { name: { contains: value, mode: "insensitive" } },
            },
          },
          {
            category: {
              is: { slug: { contains: value, mode: "insensitive" } },
            },
          },
        ],
      })),
    ];
  }

  return where;
}

async function resolveCategoryId(payload) {
  if (payload.categoryId) {
    const category = await categoryRepository.findById(payload.categoryId);
    if (!category) {
      const error = new Error("Category not found.");
      error.statusCode = 400;
      throw error;
    }

    return category.id;
  }

  const slug = String(payload.categorySlug || "").trim();
  if (!slug) return null;

  const existingCategory = await categoryRepository.findBySlug(slug);
  if (existingCategory) return existingCategory.id;

  const createdCategory = await categoryRepository.create({
    name: payload.categoryName || slug,
    slug,
    description: "",
  });

  return createdCategory.id;
}

async function listPublic(query) {
  const search = String(query.search || query.q || "").trim();
  const category = String(query.category || "").trim();
  const city = String(query.city || "").trim();
  const sefar = String(query.sefar || "").trim();
  const maxPrice = Number(query.maxPrice || 0);
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { city: { contains: search } },
      { location: { contains: search } },
      { category: { is: { slug: { contains: search } } } },
      { category: { is: { name: { contains: search } } } },
    ];
  }

  if (category && category !== "all") {
    where.category = {
      is: {
        OR: [{ slug: category }, { id: category }, { name: category }],
      },
    };
  }

  if (city && city !== "all") {
    where.city = city;
  }

  if (sefar && sefar !== "all") {
    where.location = { contains: sefar };
  }

  if (maxPrice > 0) {
    where.pricePerDay = { lte: maxPrice };
  }

  return listingRepository.findPublic({
    where: buildPublicListingWhere(query),
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function listMy(userId) {
  return listingRepository.findManyByOwner(userId, {
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function listManage() {
  return listingRepository.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getById(id) {
  const listing = await listingRepository.findById(id);

  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  return toListingData(listing);
}

async function create(ownerId, payload, files) {
  const uploadedFiles = getUploadedFiles(files);
  const paymentProofFile = uploadedFiles.paymentProof[0] || null;
  const categoryId = await resolveCategoryId(payload);

  return listingRepository.create({
    title: payload.title,
    description: payload.description,
    categoryId,
    ownerId,
    city: payload.city,
    location: payload.location,
    pricePerDay: Number(payload.pricePerDay),
    paymentMethod: payload.paymentMethod || null,
    paymentProofUrl:
      paymentProofPath(paymentProofFile) || payload.paymentProofUrl || null,
    paymentStatus: payload.paymentStatus || "PENDING",
    status: String(payload.status || "PENDING").toUpperCase(),
    images: {
      create: mapUploadedImages(uploadedFiles.images),
    },
  });
}

async function update(user, id, payload) {
  const listing = await getById(id);

  ensureOwnerOrAdmin(user, listing);

  return listingRepository.update(id, {
    title: payload.title,
    description: payload.description,
    city: payload.city,
    location: payload.location,
    pricePerDay: payload.pricePerDay ? Number(payload.pricePerDay) : undefined,
  });
}

async function remove(user, id) {
  const listing = await getById(id);

  ensureOwnerOrAdmin(user, listing);

  return listingRepository.remove(id);
}

async function approve(id, adminId) {
  const listing = await listingRepository.update(id, {
    status: "APPROVED",
    approvedById: adminId,
    approvedAt: new Date(),
  });

  await notificationService.notifyListingApproved(listing);

  return listing;
}

async function reject(id, reason, adminId) {
  const listing = await listingRepository.update(id, {
    status: "REJECTED",
    rejectionReason: reason || "Rejected by admin.",
    approvedById: adminId,
    approvedAt: new Date(),
  });

  await notificationService.notifyListingRejected(listing, reason);

  return listing;
}

module.exports = {
  listPublic,
  listMy,
  listManage,
  getById,
  create,
  update,
  remove,
  approve,
  reject,
};
