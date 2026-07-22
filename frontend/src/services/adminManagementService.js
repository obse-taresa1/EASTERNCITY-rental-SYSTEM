import { apiClient } from "./apiClient.js";

function query(params = {}) {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined && value !== "");
  const search = new URLSearchParams(clean).toString();
  return search ? `?${search}` : "";
}

export const adminApi = {
  analytics: (params) => apiClient.get(`/api/admin-management/analytics${query(params)}`),
  users: (params) => apiClient.get(`/api/admin-management/users${query(params)}`),
  createAdmin: (body) => apiClient.post("/api/admin-management/admins", body),
  updateUser: (id, body) => apiClient.patch(`/api/admin-management/users/${id}`, body),
  deleteUser: (id) => apiClient.delete(`/api/admin-management/users/${id}`),
  listings: (params) => apiClient.get(`/api/admin-management/listings${query(params)}`),
  updateListing: (id, body) => apiClient.patch(`/api/admin-management/listings/${id}`, body),
  deleteListing: (id) => apiClient.delete(`/api/admin-management/listings/${id}`),
  categories: () => apiClient.get("/api/admin-management/categories"),
  createCategory: (body) => apiClient.post("/api/admin-management/categories", body),
  updateCategory: (id, body) => apiClient.patch(`/api/admin-management/categories/${id}`, body),
  deleteCategory: (id) => apiClient.delete(`/api/admin-management/categories/${id}`),
  bookings: (params) => apiClient.get(`/api/admin-management/bookings${query(params)}`),
  promotions: (params) => apiClient.get(`/api/admin-management/promotions${query(params)}`),
  updatePromotion: (id, body) => apiClient.patch(`/api/admin-management/promotions/${id}`, body),
  reviews: (params) => apiClient.get(`/api/admin-management/reviews${query(params)}`),
  deleteReview: (id) => apiClient.delete(`/api/admin-management/reviews/${id}`),
  reports: (params) => apiClient.get(`/api/admin-management/reports${query(params)}`),
  updateReport: (id, body) => apiClient.patch(`/api/admin-management/reports/${id}`, body),
  supportTickets: (params) => apiClient.get(`/api/admin-management/support-tickets${query(params)}`),
  updateSupportTicket: (id, body) => apiClient.patch(`/api/admin-management/support-tickets/${id}`, body),
  contactMessages: () => apiClient.get("/api/admin-management/contact-messages"),
  updateContactMessage: (id, body) => apiClient.patch(`/api/admin-management/contact-messages/${id}`, body),
  notifications: () => apiClient.get("/api/admin-management/notifications"),
  createNotification: (body) => apiClient.post("/api/admin-management/notifications", body),
  settings: () => apiClient.get("/api/admin-management/settings"),
  saveSettings: (body) => apiClient.put("/api/admin-management/settings", body),
  logs: (params) => apiClient.get(`/api/admin-management/logs${query(params)}`),
};


export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function useAdminRefresh() {
  window.dispatchEvent(new Event("easterncity:admin-data-updated"));
}

