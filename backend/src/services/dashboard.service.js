const prisma = require("../config/db");

function getDateRange(range = "month", from, to) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  let start;

  if (from) {
    start = new Date(from);
  } else if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "week") {
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

function createdBetween(start, end) {
  return { createdAt: { gte: start, lte: end } };
}

function monthSeries(records, amountKey) {
  const values = Array.from({ length: 12 }, () => 0);

  records.forEach((record) => {
    const date = new Date(record.createdAt);
    if (Number.isNaN(date.getTime())) return;
    values[date.getMonth()] += amountKey ? Number(record[amountKey] || 0) : 1;
  });

  return values;
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function money(value) {
  return Number(value || 0);
}

function topBreakdown(rows, labelKey, valueKey = "_count") {
  const total = rows.reduce((sum, row) => sum + Number(row[valueKey] || 0), 0) || 1;

  return rows.slice(0, 3).map((row) => ({
    label: row[labelKey] || "Unknown",
    value: Number(row[valueKey] || 0),
    percent: percent(Number(row[valueKey] || 0), total),
  }));
}

function mapRecent(type, records, getDetail, getStatus) {
  return records.map((record) => ({
    id: `${type}-${record.id}`,
    type,
    detail: getDetail(record),
    status: getStatus(record),
    date: record.createdAt,
  }));
}

async function getSharedDashboardData({ range, from, to }) {
  const { start, end } = getDateRange(range, from, to);
  const dateWhere = createdBetween(start, end);
  const activeListingStatuses = ["APPROVED", "ACTIVE", "AVAILABLE", "Approved", "Active", "Available"];
  const pendingListingStatuses = ["PENDING", "PENDING_APPROVAL", "UNDER_REVIEW", "Pending", "Pending Approval", "Under Review"];
  const rejectedListingStatuses = ["REJECTED", "Rejected"];
  const approvedPromotionStatuses = ["APPROVED", "ACTIVE", "Approved", "Active"];

  const [
    totalUsers,
    totalAdmins,
    totalOwners,
    totalRenters,
    totalListings,
    activeListings,
    pendingListings,
    rejectedListings,
    featuredListings,
    promotionRequests,
    promotionHistory,
    platformFeePayments,
    reviews,
    notifications,
    supportTickets,
    contactMessages,
    reports,
    verificationRequests,
    recentUsers,
    recentListings,
    recentPromotions,
    recentNotifications,
    listingSeries,
    userSeries,
    promotionSeries,
    listingsByCity,
    listingsByCategory,
    listingFeeRevenue,
    promotionRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: dateWhere }),
    prisma.user.count({ where: { role: "ADMIN", ...dateWhere } }),
    prisma.listing.findMany({ where: dateWhere, distinct: ["ownerId"], select: { ownerId: true } }).then((rows) => rows.length),
    prisma.booking.findMany({ where: dateWhere, distinct: ["renterId"], select: { renterId: true } }).then((rows) => rows.length),
    prisma.listing.count({ where: dateWhere }),
    prisma.listing.count({ where: { status: { in: activeListingStatuses }, ...dateWhere } }),
    prisma.listing.count({ where: { status: { in: pendingListingStatuses }, ...dateWhere } }),
    prisma.listing.count({ where: { status: { in: rejectedListingStatuses }, ...dateWhere } }),
    prisma.promotion.count({ where: { status: { in: approvedPromotionStatuses }, ...dateWhere } }),
    prisma.promotion.count({ where: dateWhere }),
    prisma.promotion.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 8, include: { listing: true } }),
    prisma.booking.aggregate({ where: dateWhere, _sum: { serviceFee: true } }),
    prisma.review.count({ where: dateWhere }),
    prisma.notification.count({ where: dateWhere }),
    prisma.supportTicket.count({ where: dateWhere }),
    prisma.contactMessage.count({ where: dateWhere }),
    prisma.report.count({ where: dateWhere }),
    prisma.user.count({ where: { verificationStatus: { in: ["PENDING", "pending"] }, ...dateWhere } }),
    prisma.user.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.listing.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.promotion.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 4, include: { listing: true } }),
    prisma.notification.findMany({ where: dateWhere, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.listing.findMany({ where: dateWhere, select: { createdAt: true } }),
    prisma.user.findMany({ where: dateWhere, select: { createdAt: true } }),
    prisma.promotion.findMany({ where: dateWhere, select: { createdAt: true, amount: true } }),
    prisma.listing.groupBy({ by: ["city"], where: dateWhere, _count: true, orderBy: { _count: { city: "desc" } }, take: 3 }),
    prisma.listing.groupBy({ by: ["categoryId"], where: dateWhere, _count: true, orderBy: { _count: { categoryId: "desc" } }, take: 3 }),
    prisma.booking.aggregate({ where: dateWhere, _sum: { serviceFee: true } }),
    prisma.promotion.aggregate({ where: { status: { in: approvedPromotionStatuses }, ...dateWhere }, _sum: { amount: true } }),
  ]);

  const categoryNames = await prisma.category.findMany({
    where: { id: { in: listingsByCategory.map((row) => row.categoryId).filter(Boolean) } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(categoryNames.map((category) => [category.id, category.name]));
  const categoryBreakdown = listingsByCategory.map((row) => ({
    label: categoryMap.get(row.categoryId) || "Uncategorized",
    value: row._count,
  }));

  const recentRows = [
    ...mapRecent("Recent User", recentUsers, (user) => user.email || user.name, (user) => user.role),
    ...mapRecent("Recent Listing", recentListings, (listing) => listing.title, (listing) => listing.status),
    ...mapRecent("Recent Promotion Payment", recentPromotions, (promotion) => promotion.listing?.title || promotion.packageType, (promotion) => promotion.status),
    ...mapRecent("Recent Activity", recentNotifications, (notification) => notification.title, (notification) => notification.isRead ? "Read" : "Unread"),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    range: { start, end },
    counts: {
      totalUsers,
      totalAdmins,
      totalOwners,
      totalRenters,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      featuredListings,
      promotionRequests,
      promotionHistory: promotionHistory.length,
      platformFeePayments: money(platformFeePayments._sum.serviceFee),
      verificationRequests,
      reviews,
      reports,
      contactMessages,
      supportTickets,
      notifications,
      systemHealth: 100,
    },
    revenue: {
      promotionRevenue: money(promotionRevenue._sum.amount),
      listingFeeRevenue: money(listingFeeRevenue._sum.serviceFee),
    },
    breakdowns: {
      listingsByCity: topBreakdown(listingsByCity, "city"),
      listingsByCategory: topBreakdown(categoryBreakdown, "label", "value"),
      listingsBySefar: [],
    },
    charts: {
      userGrowth: monthSeries(userSeries),
      listingGrowth: monthSeries(listingSeries),
      promotionRevenue: monthSeries(promotionSeries, "amount"),
    },
    recent: {
      users: recentUsers,
      listings: recentListings,
      promotionPayments: recentPromotions,
      activities: recentRows,
      promotionHistory,
      platformActivityLogs: recentRows,
      securityLogs: [],
    },
  };
}

async function getAdminDashboard(query) {
  return getSharedDashboardData(query);
}

async function getSuperAdminDashboard(query) {
  return getSharedDashboardData(query);
}

module.exports = {
  getAdminDashboard,
  getSuperAdminDashboard,
};



