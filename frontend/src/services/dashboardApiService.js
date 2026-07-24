import { apiClient } from "./apiClient.js";

function buildDashboardQuery(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function normalizeDashboardData(data) {
  return {
    counts: data?.counts || {},
    revenue: data?.revenue || {},
    breakdowns: data?.breakdowns || {},
    chart: data?.chart || {},
    recentRows: Array.isArray(data?.recentRows) ? data.recentRows : [],
    range: data?.range || "month",
    startDate: data?.startDate || "",
    endDate: data?.endDate || "",
  };
}

export async function fetchAdminDashboard(filters = {}) {
  const data = await apiClient.get(`/api/dashboard/admin${buildDashboardQuery(filters)}`);
  return normalizeDashboardData(data);
}

export async function fetchSuperAdminDashboard(filters = {}) {
  const data = await apiClient.get(`/api/dashboard/super-admin${buildDashboardQuery(filters)}`);
  return normalizeDashboardData(data);
}
