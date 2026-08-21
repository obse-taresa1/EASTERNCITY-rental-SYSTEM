const prisma = require("../config/db");
const { sendContactReplyEmail } = require("./emailService");
const { hashPassword } = require("../utils/hash");

function statusIn(values) {
  return { in: values.flatMap((value) => [value, value.toUpperCase(), value.toLowerCase()]) };
}

function userSelect() {
  return {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    city: true,
    phone: true,
    verificationStatus: true,
    nationalIdNumber: true,
    nationalIdFrontUrl: true,
    nationalIdBackUrl: true,
    createdAt: true,
    _count: { select: { listings: true, rentedBookings: true, reviews: true } },
  };
}

async function log({ action, actor, type = "ACTIVITY", metadata }) {
  return prisma.activityLog.create({
    data: {
      action,
      actorId: actor?.id,
      actorName: actor?.name || actor?.email || "System",
      type,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  }).catch(() => null);
}

async function listUsers(query = {}) {
  const where = {};
  if (query.role) where.role = query.role;
  if (query.status && query.status !== "all") where.status = statusIn([query.status]);
  if (query.search) {
    where.OR = ["name", "email", "city"].map((field) => ({ [field]: { contains: query.search, mode: "insensitive" } }));
  }
  return prisma.user.findMany({ where, select: userSelect(), orderBy: { createdAt: "desc" } });
}

async function updateUser(actor, id, payload) {
  const data = {};
  ["name", "email", "role", "status", "city", "phone", "verificationStatus", "nationalIdNumber", "nationalIdFrontUrl", "nationalIdBackUrl"].forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  if (payload.password) data.password = await hashPassword(payload.password);
  const updated = await prisma.user.update({ where: { id }, data, select: userSelect() });
  await log({ actor, action: `Updated user ${updated.email}`, metadata: { userId: id } });
  return updated;
}

async function createAdmin(actor, payload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: await hashPassword(payload.password),
      role: payload.role || "ADMIN",
      status: payload.status || "ACTIVE",
    },
    select: userSelect(),
  });
  await log({ actor, action: `Created admin ${user.email}`, type: "SECURITY", metadata: { userId: user.id } });
  return user;
}

async function deleteUser(actor, id) {
  const user = await prisma.user.update({ where: { id }, data: { status: "DELETED" }, select: userSelect() });
  await log({ actor, action: `Deleted user ${user.email}`, type: "SECURITY", metadata: { userId: id } });
  return user;
}

async function listListings(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") {
    const status = String(query.status).toLowerCase();
    if (["published", "active", "approved"].includes(status)) where.status = statusIn(["APPROVED", "ACTIVE", "PUBLISHED"]);
    else if (["under_review", "pending", "pending approval"].includes(status)) where.status = statusIn(["PENDING", "UNDER_REVIEW", "PENDING_APPROVAL"]);
    else where.status = statusIn([query.status]);
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { city: { contains: query.search, mode: "insensitive" } },
      { owner: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  return prisma.listing.findMany({
    where,
    include: { owner: { select: { id: true, name: true, email: true } }, category: true, images: true },
    orderBy: { createdAt: "desc" },
  });
}

async function updateListing(actor, id, payload) {
  const data = {};
  ["title", "description", "city", "location", "status", "rejectionReason"].forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  if (payload.pricePerDay !== undefined) data.pricePerDay = Number(payload.pricePerDay);
  if (payload.categoryId !== undefined) data.categoryId = payload.categoryId || null;
  if (["APPROVED", "PUBLISHED", "ACTIVE"].includes(data.status)) {
    data.status = "APPROVED";
    data.approvedById = actor.id;
    data.approvedAt = new Date();
  }
  const listing = await prisma.listing.update({ where: { id }, data, include: { owner: true, category: true, images: true } });
  await log({ actor, action: `Updated listing ${listing.title}`, metadata: { listingId: id, status: listing.status } });
  return listing;
}

async function deleteListing(actor, id) {
  const listing = await prisma.listing.update({ where: { id }, data: { status: "DELETED" }, include: { owner: true, category: true, images: true } });
  await log({ actor, action: `Deleted listing ${listing.title}`, metadata: { listingId: id } });
  return listing;
}

async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true } }, listings: { select: { bookings: { select: { status: true } } } } },
  });
}

async function saveCategory(actor, payload, id) {
  const data = { name: payload.name, slug: payload.slug, description: payload.description || "" };
  const category = id ? await prisma.category.update({ where: { id }, data }) : await prisma.category.create({ data });
  await log({ actor, action: `${id ? "Updated" : "Created"} category ${category.name}`, metadata: { categoryId: category.id } });
  return category;
}

async function deleteCategory(actor, id) {
  const category = await prisma.$transaction(async (tx) => {
    await tx.listing.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    return tx.category.delete({ where: { id } });
  });
  await log({ actor, action: `Deleted category ${category.name}`, metadata: { categoryId: id } });
  return category;
}

async function listBookings(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") where.status = statusIn([query.status]);
  if (query.search) {
    where.OR = [
      { id: { contains: query.search, mode: "insensitive" } },
      { listing: { title: { contains: query.search, mode: "insensitive" } } },
      { renter: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  return prisma.booking.findMany({ where, include: { listing: true, renter: true, owner: true }, orderBy: { createdAt: "desc" } });
}

async function listPromotions(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") where.status = statusIn([query.status]);
  return prisma.promotion.findMany({ where, include: { listing: true, user: true }, orderBy: { createdAt: "desc" } });
}

async function updatePromotion(actor, id, status, reason) {
  const existingPromotion = await prisma.promotion.findUnique({ where: { id } });

  const updateData = { 
    status, 
    rejectionReason: reason, 
    approvedById: actor.id, 
    approvedAt: new Date() 
  };

  if (status === "APPROVED") {
    updateData.startDate = new Date();
    const duration = existingPromotion.durationDays || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    updateData.endDate = endDate;
  }

  const promotion = await prisma.promotion.update({
    where: { id },
    data: updateData,
    include: { listing: true, user: true },
  });
  await log({ actor, action: `${status} promotion for ${promotion.listing.title}`, metadata: { promotionId: id } });

  // When approving a Hero/Hero-Section promotion, create the HeroPromotion record
  if (status === "APPROVED" && (promotion.placement === "HERO_PROMOTION" || promotion.placement === "HERO_SECTION" || promotion.placement === "Homepage Promotion" || promotion.placement === "Homepage Banner")) {
    try {
      const heroService = require('../services/heroPromotionService');
      await heroService.createFromPromotion(promotion);
    } catch (heroErr) {
      // Log but don't fail the approval
      console.error("Failed to create HeroPromotion after approval:", heroErr.message);
    }
  }

  return promotion;
}

async function listReviews(query = {}) {
  return prisma.review.findMany({
    include: { user: true, listing: true },
    orderBy: { createdAt: "desc" },
  });
}

async function deleteReview(actor, id) {
  const review = await prisma.review.delete({ where: { id } });
  await log({ actor, action: "Deleted review", metadata: { reviewId: id } });
  return review;
}

async function listSupportTickets(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") where.status = statusIn([query.status]);
  return prisma.supportTicket.findMany({ where, include: { user: true, replies: true }, orderBy: { createdAt: "desc" } });
}

async function updateSupportTicket(actor, id, payload) {
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { status: payload.status || "RESOLVED", resolvedAt: payload.status === "OPEN" ? null : new Date() },
    include: { user: true, replies: true },
  });
  if (payload.reply) {
    await prisma.supportTicketReply.create({ data: { ticketId: id, userId: actor.id, message: payload.reply } });
  }
  await log({ actor, action: `Updated support ticket ${ticket.subject}`, metadata: { ticketId: id } });
  return ticket;
}

async function listContactMessages() {
  return prisma.contactMessage.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
}

async function updateContactMessage(actor, id, payload) {
  const existingMessage = await prisma.contactMessage.findUnique({ where: { id } });
  let emailDelivery = null;

  if (payload.adminReply && existingMessage?.email) {
    emailDelivery = await sendContactReplyEmail({
      to: existingMessage.email,
      recipientName: existingMessage.name,
      subject: existingMessage.subject,
      reply: payload.adminReply,
      adminName: actor?.name,
    });
  }

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status: payload.status, adminReply: payload.adminReply, repliedAt: payload.adminReply ? new Date() : undefined },
    include: { user: true },
  });
  await log({ actor, action: `Updated contact message ${message.subject}`, metadata: { contactMessageId: id } });
  return { ...message, emailDelivery };
}

async function listReports(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") where.status = statusIn([query.status]);
  return prisma.report.findMany({ where, include: { reporter: true }, orderBy: { createdAt: "desc" } });
}

async function updateReport(actor, id, status) {
  const report = await prisma.report.update({ where: { id }, data: { status }, include: { reporter: true } });
  await log({ actor, action: `${status} report ${report.subject}`, metadata: { reportId: id } });
  return report;
}

async function listNotifications() {
  return prisma.notification.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
}

async function createNotification(actor, payload) {
  let users = [];
  if (payload.userIdOrEmail) {
    const user = await prisma.user.findFirst({ where: { OR: [{ id: payload.userIdOrEmail }, { email: payload.userIdOrEmail }] } });
    if (user) users = [user];
  } else {
    users = await prisma.user.findMany({ select: { id: true } });
  }
  const created = await prisma.notification.createMany({
    data: users.map((user) => ({ userId: user.id, title: payload.title, body: payload.body, type: payload.type || "SYSTEM" })),
  });
  await log({ actor, action: `Sent notification ${payload.title}`, metadata: { count: created.count } });
  return created;
}

async function getSettings() {
  const rows = await prisma.systemSetting.findMany();
  return rows.reduce((result, row) => ({ ...result, [row.key]: row.value }), {});
}

async function saveSettings(actor, payload) {
  const entries = Object.entries(payload);
  await Promise.all(entries.map(([key, value]) => prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value), updatedById: actor.id },
    create: { key, value: String(value), updatedById: actor.id },
  })));
  await log({ actor, action: "Updated system settings", type: "SECURITY" });
  return getSettings();
}

// Keys that only SUPER_ADMIN can read or write
const PLATFORM_KEYS = new Set([
  'platformName', 'currency', 'defaultLanguage',
  'maintenanceMode', 'allowNewListings', 'allowNewRegistrations',
  'emailAlerts',
  'featuredListingPricePerDay', 'homepagePromotionPricePerDay',
  'minPromotionDays', 'maxPromotionDays',
  'requirePaymentVerification', 'requireAdminApproval',
]);

async function getSettingsForRole(role) {
  const rows = await prisma.systemSetting.findMany();
  const all = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  if (role === 'SUPER_ADMIN') return all;
  // ADMIN: return only admin-preference keys (anything NOT in PLATFORM_KEYS)
  const filtered = {};
  for (const [k, v] of Object.entries(all)) {
    if (!PLATFORM_KEYS.has(k)) filtered[k] = v;
  }
  return filtered;
}

async function savePlatformSettings(actor, payload) {
  // Reject any keys not in PLATFORM_KEYS
  const entries = Object.entries(payload).filter(([key]) => PLATFORM_KEYS.has(key));
  if (entries.length === 0) throw Object.assign(new Error('No valid platform settings provided.'), { statusCode: 400 });
  await Promise.all(entries.map(([key, value]) => prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value), updatedById: actor.id },
    create: { key, value: String(value), updatedById: actor.id },
  })));
  await log({ actor, action: 'Updated platform settings', type: 'SECURITY' });
  return getSettingsForRole('SUPER_ADMIN');
}

async function saveAdminPreferences(actor, payload) {
  // Admin preferences are namespaced by userId to keep them personal
  const entries = Object.entries(payload).map(([key, value]) => [
    `admin_${key}_${actor.id}`, value
  ]);
  await Promise.all(entries.map(([key, value]) => prisma.systemSetting.upsert({
    where: { key },
    update: { value: String(value), updatedById: actor.id },
    create: { key, value: String(value), updatedById: actor.id },
  })));
  await log({ actor, action: 'Updated admin preferences', type: 'INFO' });
  // Return only this admin's prefs
  const rows = await prisma.systemSetting.findMany({
    where: { key: { startsWith: `admin_` } }
  });
  const mine = rows
    .filter(r => r.key.endsWith(`_${actor.id}`))
    .reduce((acc, r) => {
      const baseKey = r.key.replace(/^admin_/, '').replace(/_[^_]+$/, '');
      return { ...acc, [baseKey]: r.value };
    }, {});
  return mine;
}

async function listLogs(query = {}) {
  const where = query.type ? { type: query.type } : {};
  return prisma.activityLog.findMany({ where, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 100 });
}

async function analytics(query = {}) {
  const now = new Date();
  const start = query.from ? new Date(query.from) : query.range === "year" ? new Date(now.getFullYear(), 0, 1) : query.range === "today" ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : query.range === "week" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = query.to ? new Date(query.to) : now;
  const createdAt = { gte: start, lte: end };
  const [userGrowth, listingGrowth, bookings, promo, verifications, cityRows, categoryRows] = await Promise.all([
    prisma.user.count({ where: { createdAt } }),
    prisma.listing.count({ where: { createdAt } }),
    prisma.booking.findMany({ where: { createdAt }, select: { serviceFee: true, totalAmount: true, listing: { select: { city: true } } } }),
    prisma.promotion.findMany({ where: { createdAt }, select: { amount: true } }),
    prisma.user.count({ where: { verificationStatus: statusIn(["APPROVED", "VERIFIED"]) } }),
    prisma.listing.groupBy({ by: ["city"], where: { createdAt }, _count: true, orderBy: { _count: { city: "desc" } }, take: 8 }),
    prisma.listing.groupBy({ by: ["categoryId"], where: { createdAt }, _count: true, orderBy: { _count: { categoryId: "desc" } }, take: 8 }),
  ]);
  const categoryNames = await prisma.category.findMany({ where: { id: { in: categoryRows.map((row) => row.categoryId).filter(Boolean) } } });
  const categoryMap = new Map(categoryNames.map((category) => [category.id, category.name]));
  return {
    userGrowth,
    listingGrowth,
    listingFeeRevenue: bookings.reduce((sum, row) => sum + Number(row.serviceFee || 0), 0),
    promoRevenue: promo.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    verifications,
    bookingGrowth: bookings.length,
    cityStats: cityRows.map((row) => ({ city: row.city || "Unknown", listings: row._count, rentals: bookings.filter((booking) => booking.listing?.city === row.city).length })),
    categoryPerformance: categoryRows.map((row) => ({ name: categoryMap.get(row.categoryId) || "Uncategorized", count: row._count })),
  };
}

async function listCommunityPosts(query = {}) {
  const where = {};
  if (query.status && query.status !== "all") where.status = query.status.toUpperCase();
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  return prisma.communityPost.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, email: true, city: true, profileImageUrl: true } },
      media: { orderBy: { createdAt: "asc" }, take: 1 },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function updateCommunityPost(actor, id, payload) {
  const numId = parseInt(id, 10);
  if (!numId || numId < 1) throw Object.assign(new Error("Invalid post id."), { statusCode: 400 });
  const data = {};
  ["status", "rejectionReason"].forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  const post = await prisma.communityPost.update({ where: { id: numId }, data, include: { author: true } });
  await log({ actor, action: `Updated community post ${post.title}`, metadata: { postId: id, status: post.status } });

  if (data.status === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "Community Post Approved",
        body: `Your community post "${post.title}" has been approved and is now live.`,
        type: "SYSTEM",
      }
    });
  } else if (data.status === "REJECTED") {
     await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "Community Post Rejected",
        body: `Your community post "${post.title}" has been rejected.`,
        type: "SYSTEM",
      }
    });
  }

  return post;
}

async function deleteCommunityPost(actor, id) {
  const numId = parseInt(id, 10);
  if (!numId || numId < 1) throw Object.assign(new Error("Invalid post id."), { statusCode: 400 });

  const post = await prisma.$transaction(async (tx) => {
    // Check if post exists
    const existingPost = await tx.communityPost.findUnique({ where: { id: numId } });
    if (!existingPost) {
      throw Object.assign(new Error("Community post not found."), { statusCode: 404 });
    }

    // Delete related records manually to handle FK constraints safely if cascade isn't set
    await tx.media.deleteMany({ where: { postId: numId } });
    await tx.comment.deleteMany({ where: { postId: numId } });
    await tx.like.deleteMany({ where: { postId: numId } });
    await tx.savedPost.deleteMany({ where: { postId: numId } });
    await tx.match.deleteMany({ where: { postId: numId } });
    await tx.ownerReply.deleteMany({ where: { postId: numId } });

    // Delete the post
    return tx.communityPost.delete({ where: { id: numId } });
  });

  await log({ actor, action: `Deleted community post ${post.title}`, type: "SECURITY", metadata: { postId: numId } });
  return post;
}

module.exports = {
  analytics,
  createAdmin,
  createNotification,
  deleteCategory,
  deleteCommunityPost,
  deleteListing,
  deleteReview,
  deleteUser,
  getSettings,
  getSettingsForRole,
  savePlatformSettings,
  saveAdminPreferences,
  listBookings,
  listCategories,
  listCommunityPosts,
  listContactMessages,
  listListings,
  listLogs,
  listNotifications,
  listPromotions,
  listReports,
  listReviews,
  listSupportTickets,
  listUsers,
  saveCategory,
  saveSettings,
  updateCommunityPost,
  updateContactMessage,
  updateListing,
  updatePromotion,
  updateReport,
  updateSupportTicket,
  updateUser,
};



