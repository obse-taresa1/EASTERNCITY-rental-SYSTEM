const listingRepository = require('../repositories/listingRepository');

function ensureOwnerOrAdmin(user, listing) {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  if (!isAdmin && listing.ownerId !== user.id) {
    const error = new Error('You do not own this listing.');
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

async function listPublic(query) {
  return listingRepository.findPublic({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getById(id) {
  const listing = await listingRepository.findById(id);

  if (!listing) {
    const error = new Error('Listing not found.');
    error.statusCode = 404;
    throw error;
  }

  return listing;
}

async function create(ownerId, payload, files) {
  return listingRepository.create({
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId,
    ownerId,
    city: payload.city,
    location: payload.location,
    pricePerDay: Number(payload.pricePerDay),
    status: 'PENDING',
    images: {
      create: mapUploadedImages(files),
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
    pricePerDay: payload.pricePerDay
      ? Number(payload.pricePerDay)
      : undefined,
  });
}

async function remove(user, id) {
  const listing = await getById(id);

  ensureOwnerOrAdmin(user, listing);

  return listingRepository.remove(id);
}

async function approve(id, adminId) {
  return listingRepository.update(id, {
    status: 'APPROVED',
    approvedById: adminId,
    approvedAt: new Date(),
  });
}

async function reject(id, reason, adminId) {
  return listingRepository.update(id, {
    status: 'REJECTED',
    rejectionReason: reason || 'Rejected by admin.',
    approvedById: adminId,
    approvedAt: new Date(),
  });
}

module.exports = {
  listPublic,
  getById,
  create,
  update,
  remove,
  approve,
  reject,
};