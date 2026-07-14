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
  return listingRepository.findPublic({
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
