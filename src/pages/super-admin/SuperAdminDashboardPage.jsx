import { useCallback, useEffect, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { fetchSuperAdminDashboard } from "../../services/dashboardApiService.js";
import { formatCurrency } from "../../utils/currency.js";

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function SuperAdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilters, setDateFilters] = useState({
    range: "month",
    startDate: "",
    endDate: "",
  });

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSuperAdminDashboard(dateFilters);
      setDashboard(data);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const events = [
      "easterncity:listings-updated",
      "easterncity:promotions-updated",
      "easterncity:users-updated",
      "easterncity:contact-messages-updated",
      "easterncity:notifications-updated",
    ];
    events.forEach((eventName) => window.addEventListener(eventName, loadDashboard));
    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, loadDashboard));
    };
  }, [loadDashboard]);

  const counts = dashboard?.counts || {};
  const revenue = dashboard?.revenue || {};
  const breakdowns = dashboard?.breakdowns || {};
  const chart = dashboard?.chart || {};

  const statCards = [
    { icon: "bi-people", label: "Total Platform Users", value: counts.totalUsers || 0 },
    { icon: "bi-shield-lock", label: "Total Admins", value: counts.totalAdmins || 0 },
    { icon: "bi-person-badge", label: "Total Owners", value: counts.totalOwners || 0 },
    { icon: "bi-person-check", label: "Total Renters", value: counts.totalRenters || 0 },
    { icon: "bi-box-seam", label: "Total Listings", value: counts.totalListings || 0 },
    { icon: "bi-grid", label: "Listings by Category", value: (breakdowns.listingsByCategory || []).length },
    { icon: "bi-geo-alt", label: "Listings by City", value: (breakdowns.listingsByCity || []).length },
    { icon: "bi-pin-map", label: "Listings by Sefar", value: (breakdowns.listingsBySefar || []).length },
    { icon: "bi-star", label: "Featured Listings", value: counts.featuredListings || 0 },
    { icon: "bi-megaphone", label: "Promotion Requests", value: counts.promotionRequests || 0 },
    { icon: "bi-cash-stack", label: "Promotion Revenue", value: formatCurrency(revenue.promotionRevenue || 0) },
    { icon: "bi-receipt", label: "Listing Fee Revenue", value: formatCurrency(revenue.listingFeeRevenue || 0) },
    { icon: "bi-person-vcard", label: "Verification Statistics", value: counts.verificationRequests || 0 },
    { icon: "bi-flag", label: "Reports & Complaints", value: counts.reports || 0 },
    { icon: "bi-headset", label: "Support Tickets", value: counts.supportTickets || 0 },
    { icon: "bi-envelope-paper", label: "Contact Messages", value: counts.contactMessages || 0 },
    { icon: "bi-bell", label: "Notifications", value: counts.notifications || 0 },
    { icon: "bi-activity", label: "Platform Activity Logs", value: dashboard?.recentRows?.length || 0 },
    { icon: "bi-shield-exclamation", label: "Security Logs", value: 0 },
    { icon: "bi-heart-pulse", label: "System Health", value: `${counts.systemHealth || 0}%` },
  ];

  const miniCards = [
    {
      icon: "bi-megaphone",
      name: "Promotion Revenue",
      value: formatCurrency(revenue.promotionRevenue || 0),
      helper: `${counts.promotionRequests || 0} requests`,
    },
    {
      icon: "bi-receipt",
      name: "Listing Fee Revenue",
      value: formatCurrency(revenue.listingFeeRevenue || 0),
      helper: `${counts.platformFeePayments || 0} payments`,
    },
    {
      icon: "bi-heart-pulse",
      name: "System Health",
      value: `${counts.systemHealth || 0}%`,
      helper: "API and database",
    },
  ];

  return (
    <AdminOverviewDashboard
      variant="superadmin"
      overview={{
        title: "Platform Overview",
        primaryValue: counts.totalUsers || 0,
        primaryLabel: "Platform Users",
        icons: ["bi-people", "bi-shield-lock", "bi-graph-up"],
        stats: [
          { label: "Admins", value: counts.totalAdmins || 0 },
          { label: "Pending Verifications", value: counts.pendingVerifications || 0 },
          { label: "System Health", value: `${counts.systemHealth || 0}%` },
        ],
        searchPlaceholder: "Search platform records",
      }}
      statCards={statCards}
      breakdown={breakdowns.listingsByCategory || []}
      ringMetrics={[
        {
          label: "Verified Requests",
          value: percent(counts.approvedVerifications || 0, counts.verificationRequests || 0),
          color: "#dc1218",
        },
        {
          label: "Approved Promotions",
          value: percent(counts.featuredListings || 0, counts.promotionRequests || 0),
          color: "#f4812a",
        },
        {
          label: "System Health",
          value: counts.systemHealth || 0,
          color: "#719f58",
        },
      ]}
      miniCards={miniCards}
      chart={{
        title: "Platform Growth Analytics",
        legends: ["Platform Growth", "Users", "Listings", "Promotions"],
        primaryFilter: "Platform metrics",
        values: chart.values || [],
      }}
      rows={dashboard?.recentRows || []}
      loading={isLoading}
      dateRange={dateFilters.range}
      startDate={dateFilters.startDate || formatDateInput(dashboard?.startDate)}
      endDate={dateFilters.endDate || formatDateInput(dashboard?.endDate)}
      onDateRangeChange={setDateFilters}
    />
  );
}
