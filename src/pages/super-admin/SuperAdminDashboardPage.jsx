import { useEffect, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { coerceRole } from "../../services/authService.js";
import { getUsers } from "../../services/userApiService.js";
import { getManagementItems } from "../../services/itemService.js";
import { getBookings } from "../../services/bookingService.js";
import { getContactMessages } from "../../services/contactMessageService.js";
import { getNotifications } from "../../services/notificationService.js";
import {
  fetchActivePromotions,
  fetchPromotionRequests,
} from "../../services/promotionService.js";
import { roleRequests } from "../../data/roleRequests.js";
import { formatCurrency } from "../../utils/currency.js";

function uniqueCount(values) {
  return new Set(
    values.filter(Boolean).map((value) => String(value).toLowerCase()),
  ).size;
}

function statusIncludes(value, terms) {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[_-]/g, " ");
  return terms.some((term) => normalized.includes(term));
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function createMonthlySeries(records, keys) {
  const values = Array.from({ length: 12 }, () => 0);
  const fallbackMonth = new Date().getMonth();

  records.forEach((record) => {
    const rawDate = keys.map((key) => record?.[key]).find(Boolean);
    const date = rawDate ? new Date(rawDate) : null;
    const month =
      date && !Number.isNaN(date.getTime()) ? date.getMonth() : fallbackMonth;
    values[month] += 1;
  });

  return values;
}

function createBreakdown(items, key, fallback = "Unknown") {
  const counts = items.reduce((result, item) => {
    const label = item?.[key] || fallback;
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});
  const total = Math.max(items.length, 1);

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => ({
      label,
      value,
      percent: percent(value, total),
    }));
}

export default function SuperAdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const data = await getUsers();
        if (active) setUsers(data);
      } finally {
        if (active) setIsLoadingUsers(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const bookings = getBookings();
  const items = getManagementItems();
  const promotions = fetchPromotionRequests();
  const activePromotions = fetchActivePromotions();
  const contactMessages = getContactMessages();
  const notifications = getNotifications();

  const admins = users.filter((user) => coerceRole(user.role) === "ADMIN");
  const totalOwners = uniqueCount(
    items.map(
      (item) => item.ownerId || item.userId || item.ownerName || item.owner,
    ),
  );
  const totalRenters = uniqueCount(
    bookings.map((booking) => booking.renterId || booking.userId),
  );
  const verifiedUsers = users.filter((user) =>
    statusIncludes(user.verificationStatus, ["verified"]),
  ).length;
  const pendingVerifications =
    users.filter((user) => statusIncludes(user.verificationStatus, ["pending"]))
      .length +
    roleRequests.filter((request) =>
      statusIncludes(request.status, ["pending"]),
    ).length;
  const totalRevenue = promotions.reduce(
    (sum, promotion) => sum + Number(promotion.amount || 0),
    0,
  );
  const reportsAndComplaints = contactMessages.filter(
    (message) =>
      statusIncludes(message.subject, ["report", "complaint"]) ||
      statusIncludes(message.message, ["report", "complaint"]),
  ).length;
  const supportTickets = contactMessages.length;
  const systemHealth = 100;

  const statCards = [
    { icon: "bi-people", label: "Total Platform Users", value: users.length },
    { icon: "bi-shield-lock", label: "Total Admins", value: admins.length },
    { icon: "bi-person-badge", label: "Total Owners", value: totalOwners },
    { icon: "bi-person-check", label: "Total Renters", value: totalRenters },
    { icon: "bi-box-seam", label: "Total Listings", value: items.length },
    {
      icon: "bi-cash-stack",
      label: "Promotion Revenue",
      value: formatCurrency(totalRevenue),
    },
    {
      icon: "bi-megaphone",
      label: "Active Promotions",
      value: activePromotions.length,
    },
    { icon: "bi-shield-check", label: "Verified Users", value: verifiedUsers },
    {
      icon: "bi-person-vcard",
      label: "Pending Verifications",
      value: pendingVerifications,
    },
    {
      icon: "bi-flag",
      label: "Reports & Complaints",
      value: reportsAndComplaints,
    },
    { icon: "bi-headset", label: "Support Tickets", value: supportTickets },
    {
      icon: "bi-heart-pulse",
      label: "System Health",
      value: `${systemHealth}%`,
    },
  ];

  const miniCards = [
    {
      icon: "bi-megaphone",
      name: "Active Promotions",
      value: activePromotions.length,
      helper: "Live packages",
    },
    {
      icon: "bi-shield-check",
      name: "Verified Users",
      value: verifiedUsers,
      helper: "Trusted accounts",
    },
    {
      icon: "bi-bell",
      name: "Notifications",
      value: notifications.length,
      helper: "Sent alerts",
    },
  ];

  const rows = [
    ...notifications
      .slice(0, 2)
      .map((notification) => ({
        id: notification.id,
        type: "Recent Activity",
        detail: notification.title,
        status: notification.isRead ? "Read" : "Unread",
        date: formatDate(notification.createdAt),
      })),
    ...roleRequests
      .slice(0, 2)
      .map((request) => ({
        id: request.id,
        type: "Recent Verification",
        detail: request.name,
        status: request.status,
        date: "-",
      })),
    ...admins
      .slice(0, 2)
      .map((admin) => ({
        id: `admin-${admin.id}`,
        type: "Recent Admin Action",
        detail: admin.email,
        status: coerceRole(admin.role),
        date: formatDate(admin.createdAt),
      })),
    ...promotions
      .slice(0, 2)
      .map((promotion) => ({
        id: promotion.id,
        type: "Recent Payment",
        detail: promotion.listingTitle,
        status: promotion.status,
        date: formatDate(promotion.requestDate),
      })),
    ...contactMessages
      .slice(0, 2)
      .map((message) => ({
        id: message.id,
        type: "Recent Report",
        detail: message.subject,
        status: message.status,
        date: formatDate(message.createdAt),
      })),
  ];

  return (
    <AdminOverviewDashboard
      variant="superadmin"
      overview={{
        title: "Platform Overview",
        primaryValue: users.length,
        primaryLabel: "Platform Users",
        icons: ["bi-people", "bi-shield-lock", "bi-graph-up"],
        stats: [
          { label: "Admins", value: admins.length },
          { label: "Pending Verifications", value: pendingVerifications },
          { label: "System Health", value: `${systemHealth}%` },
        ],
        searchPlaceholder: "Search platform records",
      }}
      statCards={statCards}
      breakdown={createBreakdown(items, "category", "Uncategorized")}
      ringMetrics={[
        {
          label: "Verified Users",
          value: percent(verifiedUsers, Math.max(users.length, 1)),
          color: "#dc1218",
        },
        {
          label: "Active Promotions",
          value: percent(
            activePromotions.length,
            Math.max(promotions.length, 1),
          ),
          color: "#f4812a",
        },
        { label: "System Health", value: systemHealth, color: "#719f58" },
      ]}
      miniCards={miniCards}
      chart={{
        title: "Platform Growth Analytics",
        legends: [
          "Platform Growth",
          "Revenue Analytics",
          "User Registration Trends",
          "Listings by Category",
          "Listings by City",
          "Promotion Revenue Trends",
        ],
        primaryFilter: "Platform metrics",
        values: createMonthlySeries(
          [...users, ...items, ...promotions, ...notifications],
          ["createdAt", "requestDate", "updatedAt"],
        ),
      }}
      rows={rows}
      loading={isLoadingUsers}
    />
  );
}
