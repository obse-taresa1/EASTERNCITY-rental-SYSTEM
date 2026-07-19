import { apiClient } from "./apiClient.js";
import fallbackListingImage from "../assets/images/pc.png";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  "http://localhost:5000";

function resolveAssetUrl(value) {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeImages(images = []) {
  return images
    .map((image) => ({
      ...image,
      imageUrl: resolveAssetUrl(image?.imageUrl),
    }))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function normalizeOwner(owner) {
  if (!owner) return null;
  return {
    ...owner,
  };
}

function normalizeCategory(category) {
  if (!category) return null;
  return {
    ...category,
  };
}

function buildQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "all"
    ) {
      return;
    }
    params.set(key, value);
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function deriveSefar(listing) {
  if (listing.sefar) return listing.sefar;

  const location = String(listing.location || "").trim();
  const city = String(listing.city || "").trim();
  if (!location) return "";

  const [firstPart] = location.split(",").map((part) => part.trim());
  if (!firstPart || firstPart === city) return "";

  return firstPart;
}

function emitListingUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:listings-updated"));
  }
}

export function normalizeListing(listing) {
  if (!listing) return null;

  const images = normalizeImages(listing.images || []);
  const owner = normalizeOwner(listing.owner);
  const categoryData = normalizeCategory(listing.category);
  const firstImage =
    images[0]?.imageUrl ||
    resolveAssetUrl(listing.imageUrl) ||
    resolveAssetUrl(listing.coverImage) ||
    fallbackListingImage;

  const category =
    categoryData?.slug || categoryData?.id || listing.category || "";
  const sefar = deriveSefar(listing);

  return {
    ...listing,
    pricePerDay: toNumber(listing.pricePerDay),
    image: firstImage,
    coverImage: firstImage,
    images,
    owner,
    ownerName:
      owner?.businessName ||
      owner?.name ||
      listing.ownerName ||
      listing.owner ||
      "",
    category,
    categoryData,
    categoryName:
      categoryData?.name || listing.categoryName || listing.category || "",
    sefar: listing.sefar || listing.location || "",
    paymentProofUrl: resolveAssetUrl(listing.paymentProofUrl),
  };
}

export async function getPublicListings() {
  const data = await apiClient.get("/api/listings");
  return Array.isArray(data) ? data.map(normalizeListing) : [];
}

export async function getListingById(id) {
  if (!id) return null;
  const data = await apiClient.get(`/api/listings/${id}`);
  return normalizeListing(data);
}

export async function createListing(formData) {
  const payload = formData instanceof FormData ? formData : new FormData();

  if (!(formData instanceof FormData)) {
    Object.entries(formData || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => payload.append(key, item));
        return;
      }
      payload.append(key, value);
    });
  }

  const data = await apiClient.post("/api/listings", payload);
  emitListingUpdate();
  return normalizeListing(data);
}

export async function getMyListings() {
  const data = await apiClient.get("/api/listings/my");
  return Array.isArray(data) ? data.map(normalizeListing) : [];
}

export async function getManageListings() {
  const data = await apiClient.get("/api/listings/manage");
  return Array.isArray(data) ? data.map(normalizeListing) : [];
}

export async function approveListing(id) {
  const data = await apiClient.patch(`/api/listings/${id}/approve`);
  emitListingUpdate();
  return normalizeListing(data);
}

export async function rejectListing(id, reason = "Rejected by admin.") {
  const data = await apiClient.patch(`/api/listings/${id}/reject`, { reason });
  emitListingUpdate();
  return normalizeListing(data);
}

export async function deleteListing(id) {
  const data = await apiClient.delete(`/api/listings/${id}`);
  emitListingUpdate();
  return data;
}

export async function updateListing(id, updates) {
  const data = await apiClient.patch(`/api/listings/${id}`, updates);
  emitListingUpdate();
  return normalizeListing(data);
}
