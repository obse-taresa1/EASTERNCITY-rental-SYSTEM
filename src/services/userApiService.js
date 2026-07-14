import { apiClient } from "./apiClient.js";

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: String(user.role || "USER").toUpperCase(),
    status: String(user.status || "ACTIVE").toLowerCase(),
  };
}

function emitUsersUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:users-updated"));
  }
}

export async function getUsers() {
  const data = await apiClient.get("/api/users");
  return Array.isArray(data) ? data.map(normalizeUser) : [];
}

export async function createAdminUser(payload) {
  const data = await apiClient.post("/api/users/admins", payload);
  emitUsersUpdate();
  return normalizeUser(data);
}

export async function updateUser(id, payload) {
  const data = await apiClient.put(`/api/users/${id}`, payload);
  emitUsersUpdate();
  return normalizeUser(data);
}

export async function deleteUser(id) {
  const data = await apiClient.delete(`/api/users/${id}`);
  emitUsersUpdate();
  return data;
}
