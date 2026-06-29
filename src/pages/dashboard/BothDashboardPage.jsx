import { useMemo } from "react";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getBookingsByUser,
  getBookingsByOwner,
  getReviewsByUser,
} from "../../services/bookingService.js";
import { getAllItems } from "../../services/itemService.js";
import { getConversations } from "../../services/messageService.js";
import { getStorageItem } from "../../services/storageService.js";
import { formatCurrency } from "../../utils/currency.js";

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

function normalizeStatus(item) {
  return String(item.status || (item.available ? "published" : "expired")).toLowerCase();
}

const QUICK_ACTIONS = [
  { to: "/list-item", label: "Add Listing", icon: "bi-plus-circle-fill", color: "ud-action-red" },
  { to: "/my-listings", label: "View Listings", icon: "bi-card-checklist", color: "ud-action-blue" },
  { to: "/my-bookings", label: "My Bookings", icon: "bi-calendar-check", color: "ud-action-green" },
  { to: "/messages", label: "Messages", icon: "bi-chat-dots", color: "ud-action-purple" },
  { to: "/items", label: "Browse Items", icon: "bi-search", color: "ud-action-teal" },
];

export default function BothDashboardPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const allItems = getAllItems();

  const renterBookings = activeUser ? getBookingsByUser(activeUser.id) : [];
  const conversations = activeUser ? getConversations(activeUser.id) : [];
  const userReviews = activeUser ? getReviewsByUser(activeUser.id) : [];
  const savedItems = getStorageItem("saved_items", []);

  const ownedItems = useMemo(() => {
    const matches = allItems.filter(
      (item) =>
        item.owner === activeUser?.name ||
        item.owner === activeUser?.businessName ||
        item.ownerName === activeUser?.name ||
        item.ownerName === activeUser?.businessName,
    );
    return matches.length ? matches : allItems.slice(0, 6);
  }, [activeUser, allItems]);

  const ownerBookings = ownedItems.flatMap((item) => getBookingsByOwner(item.owner));

  const activeListings = ownedItems.filter((item) =>
    ["published", "active", "featured", "renewed"].includes(normalizeStatus(item)),
  ).length;

  const activeBookings = renterBookings.filter((b) =>
    ["pending", "accepted", "active"].includes(b.status),
  ).length;

  const totalEarnings = ownerBookings.reduce(
    (sum, b) => sum + Number(b.totalAmount || b.totalPrice || 0),
    0,
  );

  const isVerified = String(activeUser?.verificationStatus || "")
    .toLowerCase()
    .includes("verified");

  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "2024";

  // Recent activity feed: merge bookings + messages, sort by date
  const recentActivity = [
    ...renterBookings.slice(0, 3).map((b) => ({
      id: b.id,
      type: "booking",
      icon: "bi-calendar-check",
      color: "act-booking",
      title: b.itemTitle || "Booking",
      subtitle: `Status: ${b.status}`,
      date: b.createdAt,
    })),
    ...conversations.slice(0, 2).map((c) => ({
      id: c.id,
      type: "message",
      icon: "bi-chat-dots",
      color: "act-message",
      title: c.subject || "New Message",
      subtitle: c.context || "",
      date: c.updatedAt || c.createdAt,
    })),
    ...userReviews.slice(0, 2).map((r) => ({
      id: r.id,
      type: "review",
      icon: "bi-star-fill",
      color: "act-review",
      title: `Review: ${r.itemTitle || "Item"}`,
      subtitle: `${r.rating}★ — ${r.comment?.substring(0, 50) || ""}`,
      date: r.createdAt,
    })),
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const STAT_CARDS = [
    { icon: "bi-card-checklist", label: "Active Listings", value: activeListings, color: "stat-red", to: "/my-listings" },
    { icon: "bi-calendar-check", label: "Total Rentals", value: renterBookings.length, color: "stat-blue", to: "/my-bookings" },
    { icon: "bi-hourglass-split", label: "Active Bookings", value: activeBookings, color: "stat-green", to: "/my-bookings" },
    { icon: "bi-heart-fill", label: "Saved Items", value: savedItems.length, color: "stat-pink", to: "/saved-items" },
    { icon: "bi-chat-dots-fill", label: "Messages", value: conversations.length, color: "stat-purple", to: "/messages" },
    { icon: "bi-star-fill", label: "Reviews Given", value: userReviews.length, color: "stat-orange", to: "/reviews" },
    { icon: "bi-cash-coin", label: "Owner Earnings", value: formatCurrency(totalEarnings), color: "stat-teal", to: "/my-listings" },
    { icon: "bi-shield-check", label: "Verification", value: isVerified ? "Verified" : "Pending", color: isVerified ? "stat-verified" : "stat-pending", to: "/verification" },
  ];

  return (
    <div className="ud-overview-page">
      {/* Welcome Banner */}
      <div className="ud-welcome-banner">
        <div className="ud-welcome-avatar">
          <span>{getInitials(activeUser?.name)}</span>
          {isVerified && (
            <span className="ud-welcome-verified-badge" title="Verified">
              <i className="bi bi-patch-check-fill" />
            </span>
          )}
        </div>
        <div className="ud-welcome-info">
          <p className="ud-welcome-greeting">Welcome back,</p>
          <h1 className="ud-welcome-name">{activeUser?.name || "EasternCity User"}</h1>
          <div className="ud-welcome-tags">
            <span className={`ud-welcome-tag ${isVerified ? "tag-verified" : "tag-pending"}`}>
              <i className={`bi ${isVerified ? "bi-shield-check" : "bi-shield-exclamation"}`} />
              {activeUser?.verificationStatus || "Pending Verification"}
            </span>
            <span className="ud-welcome-tag tag-location">
              <i className="bi bi-geo-alt" />
              {activeUser?.city || "Jigjiga"}
            </span>
            <span className="ud-welcome-tag tag-since">
              <i className="bi bi-calendar3" />
              Member since {memberSince}
            </span>
          </div>
        </div>
        <Link to="/items" className="ud-welcome-cta">
          <i className="bi bi-search" />
          Browse Marketplace
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="ud-stats-grid">
        {STAT_CARDS.map((stat) => (
          <Link to={stat.to} className={`ud-stat-card ${stat.color}`} key={stat.label}>
            <div className="ud-stat-icon">
              <i className={`bi ${stat.icon}`} />
            </div>
            <div className="ud-stat-info">
              <strong className="ud-stat-value">{stat.value}</strong>
              <span className="ud-stat-label">{stat.label}</span>
            </div>
            <i className="bi bi-arrow-right ud-stat-arrow" />
          </Link>
        ))}
      </div>
      {/* Owner Booking Requests */}
      <section className="dashboard-section mt-4">
        <h2 className="h4 mb-3">Incoming Booking Requests</h2>
        {ownerBookings.length ? (
          <BookingTable bookings={ownerBookings} />
        ) : (
          <div className="owner-empty-state">
            <i className="bi bi-calendar-x" />
            Booking requests will appear here.
          </div>
        )}
      </section>

      <div className="ud-overview-bottom">
        {/* Recent Activity */}
        <section className="ud-activity-section">
          <div className="ud-section-header">
            <div>
              <h2 className="ud-section-title">Recent Activity</h2>
              <p className="ud-section-sub">Your latest bookings, messages and reviews</p>
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="ud-empty-activity">
              <i className="bi bi-activity" />
              <p>No recent activity yet. Start by browsing listings!</p>
              <Link to="/items" className="ud-btn-outline">
                Browse Items
              </Link>
            </div>
          ) : (
            <div className="ud-activity-feed">
              {recentActivity.map((item) => (
                <div className={`ud-activity-item ${item.color}`} key={item.id}>
                  <div className="ud-activity-icon">
                    <i className={`bi ${item.icon}`} />
                  </div>
                  <div className="ud-activity-text">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                  <span className="ud-activity-time">
                    {item.date ? new Date(item.date).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="ud-quick-actions-section">
          <div className="ud-section-header">
            <div>
              <h2 className="ud-section-title">Quick Actions</h2>
              <p className="ud-section-sub">Jump to what you need</p>
            </div>
          </div>
          <div className="ud-quick-actions-grid">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`ud-quick-action-card ${action.color}`}
              >
                <i className={`bi ${action.icon}`} />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
