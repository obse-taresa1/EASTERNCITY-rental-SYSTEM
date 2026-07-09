import { useEffect, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { getBookings, fetchBookings } from "../../services/bookingService.js";
import { coerceRole } from "../../services/authService.js";
import { getUsers } from "../../services/userApiService.js";
import { getManageListings } from "../../services/listingApiService.js";
import { getContactMessages } from "../../services/contactMessageService.js";
import {
  getNotifications,
  fetchNotifications,
} from "../../services/notificationService.js";
import {
  fetchActivePromotions,
  fetchPromotionRequests,
} from "../../services/promotionApiService.js";

import { useRef } from "react";
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

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  const promotionsLoaded = useRef(false);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [items, setItems] = useState([]);

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

  useEffect(() => {
    let active = true;

    async function loadPromotions() {
      try {
        const p = await fetchPromotionRequests();
        const a = await fetchActivePromotions();
        if (active) {
          setPromotions(p || []);
          setActivePromotions(a || []);
          promotionsLoaded.current = true;
        }
      } catch (err) {
        if (active) {
          setPromotions([]);
          setActivePromotions([]);
        }
      }
    }

    loadPromotions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const b = await fetchBookings();
        if (active) setBookings(b || []);
      } catch (err) {
        if (active) setBookings([]);
      }
    }

    async function loadListings() {
      try {
        const data = await getManageListings();
        if (active) setItems(data || []);
      } catch (err) {
        if (active) setItems([]);
      }
    }

    async function loadNotifications() {
      try {
        const n = await fetchNotifications();
        if (active) setNotifications(n || []);
      } catch (err) {
        if (active) setNotifications([]);
      }
    }

    loadBookings();
    loadListings();
    loadNotifications();
    return () => {
      active = false;
    };
  }, []);

  // `promotions` and `activePromotions` are loaded asynchronously via effect
  const contactMessages = getContactMessages();

  const platformUsers = users.filter(
    (user) => coerceRole(user.role) === "USER",
  );
  const totalOwners = uniqueCount(
    items.map(
      (item) => item.ownerId || item.userId || item.ownerName || item.owner,
    ),
  );
  const totalRenters = uniqueCount(
    bookings.map((booking) => booking.renterId || booking.userId),
  );
  const activeListings = items.filter(
    (item) =>
      item.available !== false &&
      !statusIncludes(item.status, ["pending", "rejected"]),
  );
  const pendingListings = items.filter((item) =>
    statusIncludes(item.status, [
      "pending",
      "under review",
      "pending approval",
    ]),
  );
  const verifiedOwners = uniqueCount(
    items
      .filter(
        (item) =>
          item.verifiedOwner ||
          statusIncludes(item.verificationStatus, ["verified"]),
      )
      .map(
        (item) => item.ownerId || item.userId || item.ownerName || item.owner,
      ),
  );
  const pendingVerifications =
    users.filter((user) => statusIncludes(user.verificationStatus, ["pending"]))
      .length + pendingListings.length;
  const promotionRevenue = promotions.reduce(
    (sum, promotion) => sum + Number(promotion.amount || 0),
    0,
  );
  const reportsAndComplaints = contactMessages.filter(
    (message) =>
      statusIncludes(message.subject, ["report", "complaint"]) ||
      statusIncludes(message.message, ["report", "complaint"]),
  ).length;

  const statCards = [
    { icon: "bi-people", label: "Total Users", value: platformUsers.length },
    { icon: "bi-person-badge", label: "Total Owners", value: totalOwners },
    { icon: "bi-person-check", label: "Total Renters", value: totalRenters },
    { icon: "bi-box-seam", label: "Total Listings", value: items.length },
    {
      icon: "bi-check-circle",
      label: "Active Listings",
      value: activeListings.length,
    },
    {
      icon: "bi-hourglass-split",
      label: "Pending Listings",
      value: pendingListings.length,
    },
    {
      icon: "bi-shield-check",
      label: "Verified Owners",
      value: verifiedOwners,
    },
    {
      icon: "bi-person-vcard",
      label: "Pending Verifications",
      value: pendingVerifications,
    },
    {
      icon: "bi-megaphone",
      label: "Active Promotions",
      value: activePromotions.length,
    },
    {
      icon: "bi-envelope-paper",
      label: "Contact Messages",
      value: contactMessages.length,
    },
    {
      icon: "bi-flag",
      label: "Reports & Complaints",
      value: reportsAndComplaints,
    },
    {
      icon: "bi-bell",
      label: "Notifications Sent",
      value: notifications.length,
    },
  ];

  const miniCards = [
    {
      icon: "bi-shield-check",
      name: "Verified Owners",
      value: verifiedOwners,
      helper: "Owner trust",
    },
    {
      icon: "bi-megaphone",
      name: "Active Promotions",
      value: activePromotions.length,
      helper: formatCurrency(promotionRevenue),
    },
    {
      icon: "bi-envelope-paper",
      name: "Contact Messages",
      value: contactMessages.length,
      helper: "Inbox",
    },
  ];

  const rows = [
    ...users
      .slice(-2)
      .reverse()
      .map((user) => ({
        id: `user-${user.id}`,
        type: "Recent User",
        detail: user.email,
        status: coerceRole(user.role),
        date: formatDate(user.createdAt),
      })),
    ...items.slice(0, 2).map((item) => ({
      id: `listing-${item.id}`,
      type: "Recent Listing",
      detail: item.title,
      status: item.status || "Active",
      date: formatDate(item.createdAt || item.requestDate),
    })),
    ...promotions.slice(0, 2).map((promotion) => ({
      id: promotion.id,
      type: "Promotion Payment",
      detail: promotion.listingTitle,
      status: promotion.status,
      date: formatDate(promotion.requestDate),
    })),
    ...contactMessages.slice(0, 2).map((message) => ({
      id: message.id,
      type: "Contact Message",
      detail: message.subject,
      status: message.status,
      date: formatDate(message.createdAt),
    })),
  ];

  return (
    <AdminOverviewDashboard
      variant="admin"
      overview={{
        title: "Marketplace Overview",
        primaryValue: activeListings.length,
        primaryLabel: "Active Listings",
        icons: ["bi-box-seam", "bi-people", "bi-megaphone"],
        stats: [
          { label: "Pending Listings", value: pendingListings.length },
          { label: "Pending Verifications", value: pendingVerifications },
          { label: "Notifications Sent", value: notifications.length },
        ],
        searchPlaceholder: "Search users, listings, payments",
      }}
      statCards={statCards}
      breakdown={createBreakdown(items, "city", "EasternCity")}
      ringMetrics={[
        {
          label: "Verified Owners",
          value: percent(verifiedOwners, Math.max(totalOwners, 1)),
          color: "#dc1218",
        },
        {
          label: "Active Listings",
          value: percent(activeListings.length, Math.max(items.length, 1)),
          color: "#f4812a",
        },
        {
          label: "Active Promotions",
          value: percent(
            activePromotions.length,
            Math.max(promotions.length, 1),
          ),
          color: "#719f58",
        },
      ]}
      miniCards={miniCards}
      chart={{
        title: "Marketplace Growth",
        legends: [
          "User Growth",
          "Listing Growth",
          "Promotion Revenue",
          "Listings by City",
        ],
        primaryFilter: "Rental marketplace",
        values: createMonthlySeries(
          [...users, ...items, ...promotions],
          ["createdAt", "requestDate", "updatedAt"],
        ),
      }}
      rows={rows}
      loading={isLoadingUsers}
    />
  );
}
