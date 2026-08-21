import { apiClient } from "./apiClient.js";
import { emitRefresh } from "../context/RefreshContext.jsx";

function query(params = {}) {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined && value !== "");
  const search = new URLSearchParams(clean).toString();
  return search ? `?${search}` : "";
}

async function mutate(request, scopes = ["adminData"]) {
  const data = await request;
  scopes.forEach((scope) => emitRefresh(scope));
  return data;
}

export const adminApi = {
  analytics: (params) => apiClient.get(`/api/admin-management/analytics${query(params)}`),
  users: (params) => apiClient.get(`/api/admin-management/users${query(params)}`),
  createAdmin: (body) =>
    mutate(apiClient.post("/api/admin-management/admins", body), ["users", "adminData"]),
  updateUser: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/users/${id}`, body), ["users", "adminData"]),
  deleteUser: (id) =>
    mutate(apiClient.delete(`/api/admin-management/users/${id}`), ["users", "adminData"]),
  listings: (params) => apiClient.get(`/api/admin-management/listings${query(params)}`),
  updateListing: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/listings/${id}`, body), ["listings", "adminData"]),
  deleteListing: (id) =>
    mutate(apiClient.delete(`/api/admin-management/listings/${id}`), ["listings", "adminData"]),
  categories: () => apiClient.get("/api/admin-management/categories"),
  createCategory: (body) =>
    mutate(apiClient.post("/api/admin-management/categories", body), ["categories", "adminData"]),
  updateCategory: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/categories/${id}`, body), ["categories", "adminData"]),
  deleteCategory: (id) =>
    mutate(apiClient.delete(`/api/admin-management/categories/${id}`), ["categories", "adminData"]),
  bookings: (params) => apiClient.get(`/api/admin-management/bookings${query(params)}`),
  promotions: (params) => apiClient.get(`/api/admin-management/promotions${query(params)}`),
  deletePromotion: (id) =>
    mutate(apiClient.delete(`/api/promotions/${id}`), ["promotions", "listings", "adminData"]),
  updatePromotion: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/promotions/${id}`, body), ["promotions", "listings", "adminData"]),
  reviews: (params) => apiClient.get(`/api/admin-management/reviews${query(params)}`),
  deleteReview: (id) =>
    mutate(apiClient.delete(`/api/admin-management/reviews/${id}`), ["reviews", "adminData"]),
  reports: (params) => apiClient.get(`/api/admin-management/reports${query(params)}`),
  updateReport: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/reports/${id}`, body), ["reports", "adminData"]),
  supportTickets: (params) => apiClient.get(`/api/admin-management/support-tickets${query(params)}`),
  updateSupportTicket: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/support-tickets/${id}`, body), ["supportTickets", "adminData"]),
  contactMessages: () => apiClient.get("/api/admin-management/contact-messages"),
  updateContactMessage: (id, body) =>
    mutate(apiClient.patch(`/api/admin-management/contact-messages/${id}`, body), ["contactMessages", "adminData"]),
  notifications: () => apiClient.get("/api/admin-management/notifications"),
  createNotification: (body) =>
    mutate(apiClient.post("/api/admin-management/notifications", body), ["notifications", "adminData"]),
  settings: () => apiClient.get("/api/admin-management/settings"),
  saveSettings: (body) =>
    mutate(apiClient.put("/api/admin-management/settings", body), ["settings", "adminData"]),
  savePlatformSettings: (body) =>
    mutate(apiClient.put("/api/admin-management/settings/platform", body), ["settings", "adminData"]),
  saveAdminPreferences: (body) =>
    mutate(apiClient.put("/api/admin-management/settings/admin", body), ["settings", "adminData"]),
  logs: (params) => apiClient.get(`/api/admin-management/logs${query(params)}`),
  communityPosts: (params) => apiClient.get(`/api/admin-management/community-posts${query(params)}`),
  updateCommunityPost: (id, body) => mutate(apiClient.patch(`/api/admin-management/community-posts/${id}`, body), ["communityPosts", "adminData"]),
  deleteCommunityPost: (id) => mutate(apiClient.delete(`/api/admin-management/community-posts/${id}`), ["communityPosts", "adminData"]),
};


export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function useAdminRefresh() {
  emitRefresh("adminData");
}

