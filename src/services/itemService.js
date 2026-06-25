import { items } from "../data/items.js";
import categoryListings from "../data/categoryListings.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const OWNER_LISTINGS_KEY = "easterncity_owner_listings";

function normalizeOwnerListing(listing) {
  return {
    ...listing,
    ownerName: listing.ownerName || listing.owner || "Verified Owner",
    verifiedOwner: listing.verificationStatus === "verified",
    photos: listing.images?.length || listing.photos || 1,
    image: listing.coverImage || listing.image,
    price: listing.price || `ETB ${Number(listing.pricePerDay || 0).toLocaleString()}`,
    specs: listing.specs || [
      { icon: "bi-geo-alt", label: listing.city || "EasternCity" },
      { icon: "bi-clock", label: listing.priceType || "Per Day" },
    ],
  };
}

export function getOwnerListings() {
  return getStorageItem(OWNER_LISTINGS_KEY, []).map(normalizeOwnerListing);
}

function writeOwnerListings(listings) {
  setStorageItem(OWNER_LISTINGS_KEY, listings);
}

export function getAllItems() {
  return [...getOwnerListings(), ...items, ...categoryListings];
}

export function getItemById(id) {
  return getAllItems().find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category) return [];
  return getAllItems().filter((item) => item.category === category);
}

export function searchItems(filters = {}) {
  const { search = "", category, city, sefar, maxPrice, status } = filters;
  const searchTerm = search.toLowerCase().trim();

  return getAllItems().filter((item) => {
    // 1. Text search
    if (searchTerm) {
      const match =
        item.title.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm);
      if (!match) return false;
    }

    // 2. Category filter
    if (category && category !== "all" && item.category !== category) {
      return false;
    }

    // 3. City filter
    if (city && city !== "all" && item.city !== city) {
      return false;
    }

    // 4. Sefar (Neighbourhood) filter
    if (sefar && sefar !== "all" && item.sefar !== sefar) {
      return false;
    }

    // 5. Max Price filter
    if (maxPrice && Number(maxPrice) > 0 && item.pricePerDay > Number(maxPrice)) {
      return false;
    }

    // 6. Status filter
    if (status && status !== "all" && item.status !== status) {
      // If items don't have status, we assume they pass or we could skip.
      if (item.status && item.status !== status) return false;
    }

    return true;
  });
}

export function saveOwnerListing(listing) {
  const listings = getStorageItem(OWNER_LISTINGS_KEY, []);
  const nextListing = normalizeOwnerListing({
    ...listing,
    id: listing.id || `owner-listing-${Date.now()}`,
    createdAt: listing.createdAt || new Date().toISOString(),
    expiresAt: listing.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    inquiries: listing.inquiries || 0,
    messages: listing.messages || 0,
  });

  writeOwnerListings([nextListing, ...listings.filter((item) => item.id !== nextListing.id)]);
  window.dispatchEvent(new Event("easterncity:listings-updated"));
  return nextListing;
}

export function deleteOwnerListing(id) {
  writeOwnerListings(getStorageItem(OWNER_LISTINGS_KEY, []).filter((item) => item.id !== id));
  window.dispatchEvent(new Event("easterncity:listings-updated"));
}

export function updateOwnerListing(id, updates) {
  let updatedListing = null;
  const listings = getStorageItem(OWNER_LISTINGS_KEY, []).map((item) => {
    if (item.id !== id) return item;
    updatedListing = normalizeOwnerListing({ ...item, ...updates });
    return updatedListing;
  });
  writeOwnerListings(listings);
  window.dispatchEvent(new Event("easterncity:listings-updated"));
  return updatedListing;
}

export function renewOwnerListing(id) {
  return updateOwnerListing(id, {
    status: "renewed",
    available: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
}

export function promoteOwnerListing(id, promotion = "7 Days Featured") {
  return updateOwnerListing(id, {
    featured: true,
    status: "featured",
    promotion,
  });
}
