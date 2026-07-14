import { apiClient } from "./apiClient.js";

function normalizeCategory(category) {
  if (!category) return null;

  return {
    ...category,
    listingsCount: category.listingsCount || category._count?.listings || 0,
    activeRentals: category.activeRentals || 0,
  };
}

function emitCategoryUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:categories-updated"));
  }
}

export async function fetchCategories() {
  const data = await apiClient.get("/api/categories");
  return Array.isArray(data) ? data.map(normalizeCategory) : [];
}

export async function createCategory(payload) {
  const data = await apiClient.post("/api/categories", payload);
  emitCategoryUpdate();
  return normalizeCategory(data);
}

export async function updateCategory(id, payload) {
  const data = await apiClient.patch(`/api/categories/${id}`, payload);
  emitCategoryUpdate();
  return normalizeCategory(data);
}

export async function deleteCategory(id) {
  const data = await apiClient.delete(`/api/categories/${id}`);
  emitCategoryUpdate();
  return data;
}
