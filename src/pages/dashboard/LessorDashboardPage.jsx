import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBookingsByOwner } from "../../services/bookingService.js";
import {
  deleteOwnerListing,
  getAllItems,
  promoteOwnerListing,
  renewOwnerListing,
} from "../../services/itemService.js";
import { formatCurrency, formatDailyPrice } from "../../utils/currency.js";

const statusTabs = [
  {
    key: "active",
    label: "Active Listings",
    statuses: ["published", "active", "approved", "renewed"],
  },
  { key: "featured", label: "Featured Listings", statuses: ["featured"] },
  { key: "pending", label: "Pending Approval", statuses: ["pending approval"] },
  { key: "draft", label: "Draft Listings", statuses: ["draft"] },
  { key: "expired", label: "Expired Listings", statuses: ["expired"] },
  { key: "rejected", label: "Rejected Listings", statuses: ["rejected"] },
];

const promotionPackages = [
  { label: "3 Days Featured", price: "100 ETB", icon: "bi-lightning-charge" },
  { label: "7 Days Featured", price: "200 ETB", icon: "bi-stars" },
  { label: "30 Days Featured", price: "500 ETB", icon: "bi-gem" },
];

const revenueCards = [
  {
    label: "Subscription Revenue",
    value: "18,500 ETB",
    icon: "bi-person-badge",
    tone: "success",
  },
  {
    label: "Featured Listing Revenue",
    value: "9,800 ETB",
    icon: "bi-megaphone",
    tone: "warning",
  },
  {
    label: "Verification Revenue",
    value: "3,200 ETB",
    icon: "bi-patch-check",
    tone: "success",
  },
  {
    label: "Advertisement Revenue",
    value: "12,400 ETB",
    icon: "bi-badge-ad",
    tone: "info",
  },
];

function normalizeStatus(item) {
  if (item.status) return item.status.toLowerCase();
  return item.available ? "published" : "expired";
}

function statusLabel(status) {
  return status
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function LessorDashboardPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [allItems, setAllItems] = useState(() => getAllItems());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function refreshListings() {
      setAllItems(getAllItems());
    }

    window.addEventListener("easterncity:listings-updated", refreshListings);
    return () =>
      window.removeEventListener(
        "easterncity:listings-updated",
        refreshListings,
      );
  }, []);

  const ownedItems = allItems.filter(
    (item) =>
      item.owner === activeUser?.name ||
      item.owner === activeUser?.businessName ||
      item.ownerName === activeUser?.name ||
      item.ownerName === activeUser?.businessName,
  );

  const visibleItems = ownedItems.length ? ownedItems : allItems;
  const freeLimit = 3;
  const usedFreeListings = Math.min(
    visibleItems.filter((item) => normalizeStatus(item) !== "rejected").length,
    freeLimit,
  );
  const freeRemaining = Math.max(freeLimit - usedFreeListings, 0);
  const featuredCount = visibleItems.filter((item) => item.featured).length;
  const totalInquiries = visibleItems.reduce(
    (sum, item) => sum + Number(item.inquiries || 0),
    0,
  );
  const activeListings = visibleItems.filter((item) =>
    ["published", "active", "featured", "renewed"].includes(
      normalizeStatus(item),
    ),
  ).length;
  const ownerBookings = visibleItems.flatMap((item) =>
    getBookingsByOwner(item.owner),
  );
  const totalEarnings = ownerBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );
  const proPlan = visibleItems.some(
    (item) => item.subscriptionPlan === "Pro Plan",
  );
  const verified = visibleItems.some(
    (item) => item.verificationStatus === "verified",
  );

  function handleDelete(item) {
    if (!item.id.startsWith("owner-listing-")) {
      setNotice(
        "Seed listings are protected demo records. New owner listings can be deleted.",
      );
      return;
    }
    deleteOwnerListing(item.id);
    setNotice(`${item.title} was deleted.`);
  }

  function handleRenew(item) {
    if (!item.id.startsWith("owner-listing-")) {
      setNotice("Renewal is ready for owner-created listings in this demo.");
      return;
    }
    renewOwnerListing(item.id);
    setNotice(`${item.title} was renewed for 30 days.`);
  }

  function handlePromote(item, promotion = "7 Days Featured") {
    if (!item.id.startsWith("owner-listing-")) {
      setNotice(`${item.title} already demonstrates the promotion workflow.`);
      return;
    }
    promoteOwnerListing(item.id, promotion);
    setNotice(`${item.title} is now featured with ${promotion}.`);
  }

  return (
    <main className="dashboard-content owner-workspace">
      <div className="dashboard-header owner-workspace-header">
        <div>
          <span className="section-label">OWNER MODE</span>
          <h1>My Listings</h1>
          <p className="owner-muted mb-0">
            You have used {usedFreeListings} of your {freeLimit} free listings.
          </p>
        </div>

        <Link
          to="/list-item"
          className="btn btn-accent-custom btn-shine owner-add-listing"
        >
          <i className="bi bi-plus-lg" /> Add New Listing
        </Link>
      </div>

      {notice && <div className="listing-form-notice">{notice}</div>}

      <div className="owner-trust-stat-grid my-4">
        <div className="owner-trust-stat premium-glass-card">
          <i className="bi bi-patch-check"></i>
          <span>Verified Owner</span>
          <strong>{verified ? "Verified" : "Pending"}</strong>
        </div>
        <div className="owner-trust-stat premium-glass-card">
          <i className="bi bi-chat-dots"></i>
          <span>Total Inquiries</span>
          <strong>{totalInquiries}</strong>
        </div>
        <div className="owner-trust-stat premium-glass-card">
          <i className="bi bi-box-seam"></i>
          <span>Active Listings</span>
          <strong>{activeListings}</strong>
        </div>
      </div>

      <div className="row g-4 my-4">
        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-box-seam"
            label="Total Listings"
            value={visibleItems.length}
          />
        </div>
        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-stars"
            label="Featured"
            value={featuredCount}
            tone="warning"
          />
        </div>
        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-chat-dots"
            label="Inquiries"
            value={visibleItems.reduce(
              (sum, item) => sum + (item.inquiries || 0),
              0,
            )}
            tone="success"
          />
        </div>
        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-wallet2"
            label="Owner Earnings"
            value={formatCurrency(totalEarnings)}
            tone="warning"
          />
        </div>
      </div>

      <section className="dashboard-section owner-revenue-section">
        <div className="owner-section-heading">
          <div>
            <span className="section-label">Revenue Section</span>
            <h2 className="h4 mb-1">Growth and Monetization</h2>
            <p className="owner-muted mb-0">
              Free entry stays open while upgrades, verification, promotions,
              and ads create revenue.
            </p>
          </div>
          <div className="owner-action-row">
            <button type="button" className="btn btn-outline-danger">
              <i className="bi bi-arrow-up-circle" /> Upgrade Plan
            </button>
            <button
              type="button"
              className="btn btn-accent-custom btn-shine"
              onClick={() => visibleItems[0] && handlePromote(visibleItems[0])}
            >
              <i className="bi bi-megaphone" /> Promote Listing
            </button>
          </div>
        </div>

        <div className="owner-revenue-grid">
          <div className="owner-monetization-card">
            <span>Free Listings Remaining</span>
            <strong>{freeRemaining}</strong>
            <small>First 3 listings are free for every new owner.</small>
          </div>
          <div className="owner-monetization-card">
            <span>Subscription Status</span>
            <strong>{proPlan ? "Pro Plan" : "Free Plan"}</strong>
            <small>
              Pro unlocks unlimited listings, credits, support, and insights.
            </small>
          </div>
          <div className="owner-monetization-card">
            <span>Verification Status</span>
            <strong>{verified ? "Verified Owner" : "Needs ID Review"}</strong>
            <small>National ID verification improves trust and ranking.</small>
          </div>
          <div className="owner-monetization-card">
            <span>Advertisement Performance</span>
            <strong>14.2k views</strong>
            <small>
              Homepage and category banner placements are ready for sponsors.
            </small>
          </div>
        </div>

        <div className="promotion-package-row">
          {promotionPackages.map((pack) => (
            <button
              type="button"
              className="promotion-package"
              key={pack.label}
              onClick={() =>
                visibleItems[0] && handlePromote(visibleItems[0], pack.label)
              }
            >
              <i className={`bi ${pack.icon}`} />
              <span>{pack.label}</span>
              <strong>{pack.price}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading">
          <div>
            <h2 className="h4 mb-1">Listing Status Workflow</h2>
            <p className="owner-muted mb-0">
              Draft to pending approval to published, then featured, expired,
              and renewed.
            </p>
          </div>
        </div>
        <div className="status-flow">
          {[
            "Draft",
            "Pending Approval",
            "Approved",
            "Published",
            "Featured",
            "Expired",
            "Renewed",
          ].map((step, index) => (
            <span key={step} className="status-flow-step">
              {index > 0 && <i className="bi bi-arrow-right-short" />}
              {step}
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading">
          <div>
            <h2 className="h4 mb-1">My Listings</h2>
            <p className="owner-muted mb-0">
              Manage edits, renewals, promotions, inquiries, and renter messages
              from one page.
            </p>
          </div>
        </div>

        <div
          className="owner-tabs"
          role="tablist"
          aria-label="Listing status filters"
        >
          {statusTabs.map((tab) => (
            <a
              href={`#${tab.key}-listings`}
              className="owner-tab"
              key={tab.key}
            >
              {tab.label}
              <span>
                {
                  visibleItems.filter((item) =>
                    tab.statuses.includes(normalizeStatus(item)),
                  ).length
                }
              </span>
            </a>
          ))}
        </div>

        <div className="owner-listing-stack">
          {statusTabs.map((tab) => {
            const tabItems = visibleItems.filter((item) =>
              tab.statuses.includes(normalizeStatus(item)),
            );

            return (
              <div
                id={`${tab.key}-listings`}
                className="owner-listing-group"
                key={tab.key}
              >
                <h3>{tab.label}</h3>
                {tabItems.length ? (
                  <div className="owner-listing-grid">
                    {tabItems.map((item) => (
                      <article
                        className="owner-listing-card premium-glass-card"
                        key={item.id}
                      >
                        <img src={item.image} alt={item.title} />
                        <div className="owner-listing-body">
                          <div className="owner-card-topline">
                            <span
                              className={`owner-status owner-status-${normalizeStatus(item).replaceAll(" ", "-")}`}
                            >
                              {statusLabel(normalizeStatus(item))}
                            </span>
                            {item.featured && (
                              <span className="owner-featured-badge">
                                Featured
                              </span>
                            )}
                          </div>
                          <h4>{item.title}</h4>
                          <p>
                            {formatDailyPrice(item.pricePerDay)} ·{" "}
                            {item.location}
                          </p>
                          <div className="owner-listing-meta">
                            <span>
                              <i className="bi bi-chat-dots" />{" "}
                              {item.inquiries || 0} inquiries
                            </span>
                            <span>
                              <i className="bi bi-envelope" />{" "}
                              {item.messages || 0} messages
                            </span>
                            <span>
                              <i className="bi bi-calendar2-week" /> Expires{" "}
                              {item.expiresAt}
                            </span>
                          </div>
                          <div className="owner-requirements-preview">
                            <strong>Rental requirements</strong>
                            <span>
                              {item.requirements?.documents?.join(", ") ||
                                "Owner review required"}
                            </span>
                          </div>
                          <div className="owner-card-actions">
                            <Link
                              to="/list-item"
                              className="btn btn-sm btn-outline-dark"
                            >
                              <i className="bi bi-pencil" /> Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item)}
                            >
                              <i className="bi bi-trash" /> Delete
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleRenew(item)}
                            >
                              <i className="bi bi-arrow-clockwise" /> Renew
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-accent-custom"
                              onClick={() => handlePromote(item)}
                            >
                              <i className="bi bi-megaphone" /> Promote
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="owner-empty-state">
                    No {tab.label.toLowerCase()} yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading">
          <div>
            <h2 className="h4 mb-1">Admin Revenue Snapshot</h2>
            <p className="owner-muted mb-0">
              Prepared analytics for subscriptions, featured listings,
              verification, and advertisements.
            </p>
          </div>
        </div>
        <div className="row g-3">
          {revenueCards.map((card) => (
            <div className="col-sm-6 col-xl-3" key={card.label}>
              <DashboardStatCard
                icon={card.icon}
                label={card.label}
                value={card.value}
                tone={card.tone}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section mt-4">
        <h2 className="h4 mb-3">Booking Requests and Messages</h2>
        {ownerBookings.length ? (
          <BookingTable bookings={ownerBookings} />
        ) : (
          <div className="owner-empty-state">
            <i className="bi bi-calendar-x" />
            Booking requests and listing messages will appear here.
          </div>
        )}
      </section>
    </main>
  );
}
