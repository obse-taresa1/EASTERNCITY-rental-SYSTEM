import { useEffect, useMemo, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { fetchAdminDashboard } from "../../services/dashboardService.js";
import { formatCurrency } from "../../utils/currency.js";

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function useLiveDashboard(loader, filters) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await loader(filters);
        if (isMounted) setState({ data, loading: false, error: "" });
      } catch (error) {
        if (isMounted) setState((current) => ({ ...current, loading: false, error: error.message || "Unable to load dashboard." }));
      }
    }

    load();
    const interval = window.setInterval(load, 30000);
    window.addEventListener("focus", load);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, [loader, filters]);

  return state;
}

export default function AdminDashboardPage() {
  const [filters, setFilters] = useState({ range: "month" });
  const stableFilters = useMemo(() => filters, [filters]);
  const { data, loading, error } = useLiveDashboard(fetchAdminDashboard, stableFilters);
  const counts = data?.counts || {};
  const revenue = data?.revenue || {};

  const statCards = [
    { icon: "bi-people", label: "Total Users", value: counts.totalUsers ?? 0 },
    { icon: "bi-person-badge", label: "Total Owners", value: counts.totalOwners ?? 0 },
    { icon: "bi-person-check", label: "Total Renters", value: counts.totalRenters ?? 0 },
    { icon: "bi-box-seam", label: "Total Listings", value: counts.totalListings ?? 0 },
    { icon: "bi-check-circle", label: "Active Listings", value: counts.activeListings ?? 0 },
    { icon: "bi-hourglass-split", label: "Pending Listings", value: counts.pendingListings ?? 0 },
    { icon: "bi-x-octagon", label: "Rejected Listings", value: counts.rejectedListings ?? 0 },
    { icon: "bi-star", label: "Featured Listings", value: counts.featuredListings ?? 0 },
    { icon: "bi-megaphone", label: "Promotion Requests", value: counts.promotionRequests ?? 0 },
    { icon: "bi-cash-stack", label: "Platform Fee Payments", value: formatCurrency(counts.platformFeePayments ?? 0) },
    { icon: "bi-person-vcard", label: "Verification Requests", value: counts.verificationRequests ?? 0 },
    { icon: "bi-chat-square-heart", label: "Reviews", value: counts.reviews ?? 0 },
    { icon: "bi-flag", label: "Reports", value: counts.reports ?? 0 },
    { icon: "bi-envelope-paper", label: "Contact Messages", value: counts.contactMessages ?? 0 },
    { icon: "bi-headset", label: "Support Tickets", value: counts.supportTickets ?? 0 },
    { icon: "bi-bell", label: "Notifications", value: counts.notifications ?? 0 },
  ];

  const miniCards = [
    { icon: "bi-megaphone", name: "Promotion Requests", value: counts.promotionRequests ?? 0, helper: formatCurrency(revenue.promotionRevenue ?? 0), color: "#8f1d33" },
    { icon: "bi-cash-stack", name: "Platform Fees", value: formatCurrency(counts.platformFeePayments ?? 0), helper: "Live revenue", color: "#6f1024" },
    { icon: "bi-headset", name: "Support Tickets", value: counts.supportTickets ?? 0, helper: "Open support", color: "#a83246" },
  ];

  const rows = (data?.recent?.activities || []).map((row) => ({ ...row, date: formatDate(row.date) }));
  const totalListings = counts.totalListings ?? 0;
  const totalUsers = counts.totalUsers ?? 0;

  return (
    <AdminOverviewDashboard
      variant="admin"
      loading={loading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
      overview={{
        title: "Marketplace Overview",
        primaryValue: counts.activeListings ?? 0,
        primaryLabel: "Active Listings",
        icons: ["bi-box-seam", "bi-people", "bi-megaphone"],
        stats: [
          { label: "Pending Listings", value: counts.pendingListings ?? 0 },
          { label: "Verification Requests", value: counts.verificationRequests ?? 0 },
          { label: "Notifications", value: counts.notifications ?? 0 },
        ],
        searchPlaceholder: "Search users, listings, payments",
      }}
      statCards={statCards}
      breakdown={data?.breakdowns?.listingsByCity || []}
      ringMetrics={[
        { label: "Active Listings", value: percent(counts.activeListings ?? 0, totalListings), color: "#7f1730" },
        { label: "Pending Listings", value: percent(counts.pendingListings ?? 0, totalListings), color: "#a83246" },
        { label: "Owners", value: percent(counts.totalOwners ?? 0, totalUsers), color: "#4f0d1e" },
      ]}
      miniCards={miniCards}
      chart={{
        title: "Marketplace Growth",
        legends: ["User Growth", "Listing Growth", "Promotion Revenue", "Listings by City"],
        primaryFilter: "Rental marketplace",
        values: data?.charts?.listingGrowth || [],
      }}
      rows={rows}
    />
  );
}
