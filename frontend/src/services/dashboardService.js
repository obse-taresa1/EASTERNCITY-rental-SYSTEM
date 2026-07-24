import { apiClient } from "./apiClient.js";

function buildDashboardQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.range) params.set("range", filters.range);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function fetchAdminDashboard(filters) {
  return apiClient.get(`/api/dashboard/admin${buildDashboardQuery(filters)}`);
}

export function fetchSuperAdminDashboard(filters) {
  return apiClient.get(`/api/dashboard/super-admin${buildDashboardQuery(filters)}`);
}
