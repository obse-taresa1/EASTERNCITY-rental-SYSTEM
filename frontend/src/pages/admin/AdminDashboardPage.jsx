import { useCallback, useEffect, useState } from "react";
import AdminOverviewDashboard from "../../components/admin/AdminOverviewDashboard.jsx";
import { fetchAdminDashboard } from "../../services/dashboardApiService.js";
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

export default function AdminDashboardPage() {
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
      const data = await fetchAdminDashboard(dateFilters);
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
    events.forEach((eventName) =>
      window.addEventListener(eventName, loadDashboard),
    );
    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, loadDashboard),
      );
    };
  }, [loadDashboard]);

  const counts = dashboard?.counts || {};
  const revenue = dashboard?.revenue || {};
  const breakdowns = dashboard?.breakdowns || {};
  const chart = dashboard?.chart || {};

  const statCards = [
    { icon: "bi-people", label: "Total Users", value: counts.totalUsers || 0 },
    {
      icon: "bi-box-seam",
      label: "Total Listings",
      value: counts.totalListings || 0,
    },
    {
      icon: "bi-check-circle",
      label: "Active Listings",
      value: counts.activeListings || 0,
    },
    {
      icon: "bi-hourglass-split",
      label: "Pending Listings",
      value: counts.pendingListings || 0,
    },
    {
      icon: "bi-x-circle",
      label: "Rejected Listings",
      value: counts.rejectedListings || 0,
    },
    {
      icon: "bi-star",
      label: "Featured Listings",
      value: counts.featuredListings || 0,
    },
    {
      icon: "bi-megaphone",
      label: "Promotion Requests",
      value: counts.promotionRequests || 0,
    },
    {
      icon: "bi-clock-history",
      label: "Promotion History",
      value: counts.promotionHistory || 0,
    },
    {
      icon: "bi-cash-stack",
      label: "Platform Fee Payments",
      value: counts.platformFeePayments || 0,
    },
    {
      icon: "bi-person-vcard",
      label: "Verification Requests",
      value: counts.verificationRequests || 0,
    },
    { icon: "bi-star-half", label: "Reviews", value: counts.reviews || 0 },
    { icon: "bi-flag", label: "Reports", value: counts.reports || 0 },
    {
      icon: "bi-envelope-paper",
      label: "Contact Messages",
      value: counts.contactMessages || 0,
    },
    {
      icon: "bi-headset",
      label: "Support Tickets",
      value: counts.supportTickets || 0,
    },
    {
      icon: "bi-bell",
      label: "Notifications",
      value: counts.notifications || 0,
    },
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
      icon: "bi-person-vcard",
      name: "Pending Verifications",
      value: counts.pendingVerifications || 0,
      helper: "Admin review",
    },
  ];

  return (
    <AdminOverviewDashboard
      variant="admin"
      loading={isLoading}
      error={null}
      overview={{
        title: "Marketplace Overview",
        primaryValue: counts.activeListings || 0,
        primaryLabel: "Active Listings",
        icons: ["bi-box-seam", "bi-people", "bi-megaphone"],
        stats: [
          { label: "Pending Listings", value: counts.pendingListings || 0 },
          {
            label: "Pending Verifications",
            value: counts.pendingVerifications || 0,
          },
          { label: "Notifications", value: counts.notifications || 0 },
        ],
        searchPlaceholder: "Search users, listings, payments",
      }}
      statCards={statCards}
      breakdown={breakdowns.listingsByCity || []}
      ringMetrics={[
        {
          label: "Approved Listings",
          value: percent(counts.activeListings || 0, counts.totalListings || 0),
          color: "#dc1218",
        },
        {
          label: "Pending Listings",
          value: percent(
            counts.pendingListings || 0,
            counts.totalListings || 0,
          ),
          color: "#f4812a",
        },
        {
          label: "Approved Promotions",
          value: percent(
            counts.featuredListings || 0,
            counts.promotionRequests || 0,
          ),
          color: "#719f58",
        },
      ]}
      miniCards={miniCards}
      chart={{
        title: "Marketplace Growth",
        legends: ["Users", "Listings", "Promotions", "Notifications"],
        primaryFilter: "Rental marketplace",
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
