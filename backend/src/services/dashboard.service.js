const prisma = require("../config/db");

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateRange(query = {}) {
  const now = new Date();
  const range = String(query.range || "month").toLowerCase();
  let startDate = normalizeDate(query.startDate);
  let endDate = normalizeDate(query.endDate);

  if (range !== "custom" || !startDate || !endDate) {
    endDate = now;
    startDate = new Date(now);

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate, range };
}

function dateWhere(startDate, endDate, field = "createdAt") {
  return {
    [field]: {
      gte: startDate,
      lte: endDate,
    },
  };
}

function statusWhere(statuses) {
  return {
    OR: statuses.map((status) => ({
      status: { equals: status, mode: "insensitive" },
    })),
  };
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
}

function formatDate(value) {
  return value ? new Date(value).toISOString() : null;
}

function monthSeries(records, dateKeys = ["createdAt"]) {
  const values = Array.from({ length: 12 }, () => 0);
  records.forEach((record) => {
    const rawDate = dateKeys.map((key) => record?.[key]).find(Boolean);
    const date = rawDate ? new Date(rawDate) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    values[date.getMonth()] += 1;
  });
  return values;
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function mapBreakdown(rows, labelKey = "label") {
  const total = rows.reduce((sum, row) => sum + row._count._all, 0);
  return rows.map((row) => ({
    label: row[labelKey] || "Unknown",
    value: row._count._all,
    percent: percent(row._count._all, total),
  }));
}

function row(type, detail, status, date, id) {
  return {
    id,
    type,
    detail: detail || "-",
    status: status || "-",
    date: formatDate(date),
  };
}

async function getCommonDashboardData(query = {}) {
  const { startDate, endDate, range } = getDateRange(query);
  const createdAtRange = dateWhere(startDate, endDate);

  const [
    users,
    admins,
    totalListings,
    activeListings,
    pendingListings,
    rejectedListings,
    featuredListings,
    listings,
    bookings,
    promotions,
    activePromotions,
    pendingPromotions,
    approvedPromotions,
    verificationRequests,
    pendingVerifications,
    approvedVerifications,
    rejectedVerifications,
    reviews,
    contactMessages,
    supportTickets,
    notifications,
    listingsByCity,
    listingsByLocation,
    listingsByCategoryRaw,
    recentUsers,
    recentListings,
    recentPromotions,
    recentContacts,
    recentSupportTickets,
    recentNotifications,
    recentVerifications,
  ] = await Promise.all([
    prisma.user.findMany({ where: createdAtRange, select: { id: true, role: true, verificationStatus: true, createdAt: true } }),
    prisma.user.count({ where: { role: { equals: "ADMIN", mode: "insensitive" }, ...createdAtRange } }),
    prisma.listing.count({ where: createdAtRange }),
    prisma.listing.count({ where: { ...createdAtRange, ...statusWhere(["APPROVED", "ACTIVE"]) } }),
    prisma.listing.count({ where: { ...createdAtRange, ...statusWhere(["PENDING", "UNDER_REVIEW", "PENDING_APPROVAL"]) } }),
    prisma.listing.count({ where: { ...createdAtRange, ...statusWhere(["REJECTED"]) } }),
    prisma.promotion.count({ where: { ...createdAtRange, ...statusWhere(["APPROVED"]) } }),
    prisma.listing.findMany({ where: createdAtRange, select: { id: true, ownerId: true, city: true, location: true, categoryId: true, createdAt: true } }),
    prisma.booking.findMany({ where: createdAtRange, select: { id: true, renterId: true, ownerId: true, totalAmount: true, createdAt: true } }),
    prisma.promotion.findMany({ where: createdAtRange, include: { listing: { select: { title: true } }, user: { select: { name: true, email: true } } } }),
    prisma.promotion.count({ where: { ...createdAtRange, ...statusWhere(["APPROVED"]) } }),
    prisma.promotion.count({ where: { ...createdAtRange, ...statusWhere(["PENDING"]) } }),
    prisma.promotion.findMany({ where: { ...createdAtRange, ...statusWhere(["APPROVED"]) }, select: { amount: true, createdAt: true } }),
    prisma.verificationRequest.findMany({ where: createdAtRange, select: { id: true, status: true, createdAt: true } }),
    prisma.verificationRequest.count({ where: { ...createdAtRange, ...statusWhere(["PENDING"]) } }),
    prisma.verificationRequest.count({ where: { ...createdAtRange, ...statusWhere(["APPROVED", "VERIFIED"]) } }),
    prisma.verificationRequest.count({ where: { ...createdAtRange, ...statusWhere(["REJECTED"]) } }),
    prisma.review.findMany({ where: createdAtRange, select: { id: true, rating: true, createdAt: true } }),
    prisma.contactMessage.findMany({ where: createdAtRange, select: { id: true, subject: true, message: true, status: true, createdAt: true } }),
    prisma.supportTicket.findMany({ where: createdAtRange, include: { user: { select: { name: true, email: true } } } }),
    prisma.notification.findMany({ where: createdAtRange, select: { id: true, title: true, type: true, isRead: true, createdAt: true } }),
    prisma.listing.groupBy({ by: ["city"], where: createdAtRange, _count: { _all: true }, orderBy: { _count: { city: "desc" } }, take: 5 }),
    prisma.listing.groupBy({ by: ["location"], where: createdAtRange, _count: { _all: true }, orderBy: { _count: { location: "desc" } }, take: 5 }),
    prisma.listing.groupBy({ by: ["categoryId"], where: createdAtRange, _count: { _all: true }, orderBy: { _count: { categoryId: "desc" } }, take: 5 }),
    prisma.user.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.listing.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.promotion.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5, include: { listing: { select: { title: true } } } }),
    prisma.contactMessage.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.supportTicket.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true, email: true } } } }),
    prisma.notification.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.verificationRequest.findMany({ where: createdAtRange, orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true, email: true } } } }),
  ]);

  const categoryIds = listingsByCategoryRaw.map((item) => item.categoryId).filter(Boolean);
  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    : [];
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));

  const reportsAndComplaints = contactMessages.filter((message) => {
    const text = `${message.subject || ""} ${message.message || ""}`.toLowerCase();
    return text.includes("report") || text.includes("complaint");
  });
  const promotionRevenue = approvedPromotions.reduce((sum, promotion) => sum + toNumber(promotion.amount), 0);

  const recentRows = [
    ...recentUsers.map((user) => row("Recent User", user.email, user.role, user.createdAt, `user-${user.id}`)),
    ...recentListings.map((listing) => row("Recent Listing", listing.title, listing.status, listing.createdAt, `listing-${listing.id}`)),
    ...recentPromotions.map((promotion) => row("Promotion Payment", promotion.listing?.title, promotion.status, promotion.createdAt, `promotion-${promotion.id}`)),
    ...recentContacts.map((message) => row("Contact Message", message.subject, message.status, message.createdAt, `contact-${message.id}`)),
    ...recentSupportTickets.map((ticket) => row("Support Ticket", ticket.subject, ticket.status, ticket.createdAt, `ticket-${ticket.id}`)),
    ...recentNotifications.map((notification) => row("Notification", notification.title, notification.isRead ? "Read" : "Unread", notification.createdAt, `notification-${notification.id}`)),
    ...recentVerifications.map((request) => row("Verification Request", request.user?.email || request.user?.name, request.status, request.createdAt, `verification-${request.id}`)),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 12);

  return {
    range,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    counts: {
      totalUsers: users.length,
      totalAdmins: admins,
      totalOwners: new Set(listings.map((listing) => listing.ownerId).filter(Boolean)).size,
      totalRenters: new Set(bookings.map((booking) => booking.renterId).filter(Boolean)).size,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      featuredListings,
      promotionRequests: promotions.length,
      pendingPromotions,
      promotionHistory: promotions.filter((promotion) => String(promotion.status || "").toUpperCase() !== "PENDING").length,
      platformFeePayments: listings.filter((listing) => listing.id).length,
      verificationRequests: verificationRequests.length,
      pendingVerifications,
      approvedVerifications,
      rejectedVerifications,
      reviews: reviews.length,
      reports: reportsAndComplaints.length,
      contactMessages: contactMessages.length,
      supportTickets: supportTickets.length,
      notifications: notifications.length,
      systemHealth: 100,
    },
    revenue: {
      promotionRevenue,
      listingFeeRevenue: 0,
    },
    breakdowns: {
      listingsByCity: mapBreakdown(listingsByCity, "city"),
      listingsBySefar: mapBreakdown(listingsByLocation, "location"),
      listingsByCategory: listingsByCategoryRaw.map((item) => ({
        label: item.categoryId ? categoryById.get(item.categoryId) || "Uncategorized" : "Uncategorized",
        value: item._count._all,
        percent: percent(item._count._all, listings.length),
      })),
    },
    chart: {
      values: monthSeries([...users, ...listings, ...promotions, ...notifications, ...reviews]),
      promotionRevenueValues: monthSeries(approvedPromotions),
    },
    recentRows,
  };
}

async function getAdminDashboard(query) {
  return getCommonDashboardData(query);
}

async function getSuperAdminDashboard(query) {
  return getCommonDashboardData(query);
}

module.exports = {
  getAdminDashboard,
  getSuperAdminDashboard,
};
