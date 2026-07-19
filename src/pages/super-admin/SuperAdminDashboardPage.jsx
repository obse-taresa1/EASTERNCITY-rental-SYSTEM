import { useEffect, useMemo, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { fetchSuperAdminDashboard } from "../../services/dashboardService.js";
import { formatCurrency } from "../../utils/currency.js";

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

export default function SuperAdminDashboardPage() {
  const [filters, setFilters] = useState({ range: "month" });
  const stableFilters = useMemo(() => filters, [filters]);
  const { data, loading, error } = useLiveDashboard(fetchSuperAdminDashboard, stableFilters);
  const counts = data?.counts || {};
  const revenue = data?.revenue || {};

  const statCards = [
    { icon: "bi-people", label: "Total Platform Users", value: counts.totalUsers ?? 0 },
    { icon: "bi-shield-lock", label: "Total Admins", value: counts.totalAdmins ?? 0 },
    { icon: "bi-person-badge", label: "Total Owners", value: counts.totalOwners ?? 0 },
    { icon: "bi-person-check", label: "Total Renters", value: counts.totalRenters ?? 0 },
    { icon: "bi-box-seam", label: "Total Listings", value: counts.totalListings ?? 0 },
    { icon: "bi-grid", label: "Listings by Category", value: data?.breakdowns?.listingsByCategory?.length ?? 0 },
    { icon: "bi-geo-alt", label: "Listings by City", value: data?.breakdowns?.listingsByCity?.length ?? 0 },
    { icon: "bi-map", label: "Listings by Sefar", value: data?.breakdowns?.listingsBySefar?.length ?? 0 },
    { icon: "bi-star", label: "Featured Listings", value: counts.featuredListings ?? 0 },
    { icon: "bi-megaphone", label: "Promotion Requests", value: counts.promotionRequests ?? 0 },
    { icon: "bi-cash-stack", label: "Promotion Revenue", value: formatCurrency(revenue.promotionRevenue ?? 0) },
    { icon: "bi-receipt", label: "Listing Fee Revenue", value: formatCurrency(revenue.listingFeeRevenue ?? 0) },
    { icon: "bi-person-vcard", label: "Verification Statistics", value: counts.verificationRequests ?? 0 },
    { icon: "bi-flag", label: "Reports & Complaints", value: counts.reports ?? 0 },
    { icon: "bi-headset", label: "Support Tickets", value: counts.supportTickets ?? 0 },
    { icon: "bi-envelope-paper", label: "Contact Messages", value: counts.contactMessages ?? 0 },
    { icon: "bi-bell", label: "Notifications", value: counts.notifications ?? 0 },
    { icon: "bi-heart-pulse", label: "System Health", value: `${counts.systemHealth ?? 100}%` },
  ];

  const miniCards = [
    { icon: "bi-cash-stack", name: "Promotion Revenue", value: formatCurrency(revenue.promotionRevenue ?? 0), helper: "Approved promos", color: "#8f1d33" },
    { icon: "bi-receipt", name: "Listing Fee Revenue", value: formatCurrency(revenue.listingFeeRevenue ?? 0), helper: "Platform fees", color: "#6f1024" },
    { icon: "bi-heart-pulse", name: "System Health", value: `${counts.systemHealth ?? 100}%`, helper: "Live status", color: "#a83246" },
  ];

  const rows = (data?.recent?.platformActivityLogs || []).map((row) => ({ ...row, date: formatDate(row.date) }));
  const totalListings = counts.totalListings ?? 0;
  const totalUsers = counts.totalUsers ?? 0;

  return (
    <AdminOverviewDashboard
      variant="superadmin"
      loading={loading}
      error={error}
      filters={filters}
      onFiltersChange={setFilters}
      overview={{
        title: "Platform Overview",
        primaryValue: counts.totalUsers ?? 0,
        primaryLabel: "Platform Users",
        icons: ["bi-people", "bi-shield-lock", "bi-graph-up"],
        stats: [
          { label: "Admins", value: counts.totalAdmins ?? 0 },
          { label: "Promotion Requests", value: counts.promotionRequests ?? 0 },
          { label: "System Health", value: `${counts.systemHealth ?? 100}%` },
        ],
        searchPlaceholder: "Search platform records",
      }}
      statCards={statCards}
      breakdown={data?.breakdowns?.listingsByCategory || []}
      ringMetrics={[
        { label: "Owners", value: percent(counts.totalOwners ?? 0, totalUsers), color: "#7f1730" },
        { label: "Active Listings", value: percent(counts.activeListings ?? 0, totalListings), color: "#a83246" },
        { label: "System Health", value: counts.systemHealth ?? 100, color: "#4f0d1e" },
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
        values: data?.charts?.userGrowth || [],
      }}
      rows={rows}
      loading={isLoadingUsers}
    />
  );
}
