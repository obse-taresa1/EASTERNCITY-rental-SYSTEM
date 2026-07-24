import { items } from "../data/items.js";
import categoryListings from "../data/categoryListings.js";
import { homeListings } from "../data/homeListings.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const OWNER_LISTINGS_KEY = "easterncity_owner_listings";
const PUBLIC_LISTING_STATUSES = new Set(["published", "active", "featured", "renewed"]);
const PROMOTION_PRIORITY = {
  "homepage-banner": 3,
  "top-listing": 2,
  featured: 1,
};
export const LISTING_FEE_AMOUNT = 150;

function normalizeListingStatus(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .trim();
}

function normalizePromotionPlacement(placement) {
  const normalized = String(placement || "")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .trim();

  if (["homepage-banner", "home-banner", "homepage"].includes(normalized)) {
    return "homepage-banner";
  }
  if (["top-listing", "top"].includes(normalized)) {
    return "top-listing";
  }
  if (["featured", "featured-listing"].includes(normalized)) {
    return "featured";
  }
  return "";
}

export function resolvePromotionPlacement(packageId, promotionText = "") {
  const text = String(promotionText || "").toLowerCase();
  if (text.includes("home") || text.includes("banner")) return "homepage-banner";
  if (text.includes("top")) return "top-listing";
  if (text.includes("featured")) return "featured";

  switch (Number(packageId)) {
    case 3:
      return "homepage-banner";
    case 2:
      return "top-listing";
    case 1:
      return "featured";
    default:
      return "";
  }
}

export function getPromotionPlacement(item) {
  return (
    normalizePromotionPlacement(item?.promotionPlacement) ||
    resolvePromotionPlacement(item?.promotionPackageId || item?.packageId, item?.promotionType || item?.promotion)
  );
}

export function getPromotionLabel(item) {
  switch (getPromotionPlacement(item)) {
    case "homepage-banner":
      return "Home Banner";
    case "top-listing":
      return "Top Listing";
    case "featured":
      return "Featured";
    default:
      return "";
  }
}

export function sortPromotedListingsFirst(listings) {
  return [...listings].sort((a, b) => {
    const promotionDelta =
      (PROMOTION_PRIORITY[getPromotionPlacement(b)] || 0) -
      (PROMOTION_PRIORITY[getPromotionPlacement(a)] || 0);
    if (promotionDelta) return promotionDelta;

    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}

export function isPublicListing(listing) {
  const status = normalizeListingStatus(listing.status);
  if (!status) return listing.available !== false;
  return PUBLIC_LISTING_STATUSES.has(status);
}

function normalizeOwnerListing(listing) {
  return {
    ...listing,
    ownerName: listing.ownerName || listing.owner || "Verified Owner",
    verifiedOwner: listing.verificationStatus === "verified",
    photos: listing.images?.length || listing.photos || 1,
    image: listing.coverImage || listing.image,
    price:
      listing.price ||
      `ETB ${Number(listing.pricePerDay || 0).toLocaleString()}`,
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

export function getPublicOwnerListings() {
  return getOwnerListings().filter(isPublicListing);
}

export function getManagementItems() {
  return [...getOwnerListings(), ...items, ...categoryListings, ...homeListings];
}

export function getAllItems() {
  return sortPromotedListingsFirst([
    ...getPublicOwnerListings(),
    ...items,
    ...categoryListings,
    ...homeListings,
  ]);
}

export function getItemById(id) {
  return getAllItems().find((item) => item.id === id);
}

export function getItemsByCategory(category) {
  if (!category) return [];
  return sortPromotedListingsFirst(
    getAllItems().filter((item) => item.category === category),
  );
}

export function searchItems(filters = {}) {
  const { search = "", category, city, sefar, maxPrice, status } = filters;
  const searchTerm = search.toLowerCase().trim();

  return sortPromotedListingsFirst(getAllItems().filter((item) => {
    const hiddenStatuses = ["draft", "payment pending", "under review", "pending", "pending approval", "rejected"];
    const normalizedStatus = normalizeListingStatus(item.status);
    if ((!status || status === "all") && hiddenStatuses.includes(normalizedStatus)) {
      return false;
    }

    if (searchTerm) {
      const match =
        item.title.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm);
      if (!match) return false;
    }

    if (category && category !== "all" && item.category !== category) {
      return false;
    }

    if (city && city !== "all" && item.city !== city) {
      return false;
    }

    if (sefar && sefar !== "all" && item.sefar !== sefar) {
      return false;
    }

    if (
      maxPrice &&
      Number(maxPrice) > 0 &&
      item.pricePerDay > Number(maxPrice)
    ) {
      return false;
    }

    if (status && status !== "all" && item.status !== status) {
      if (item.status && item.status !== status) return false;
    }

    return true;
  }));
}

export function saveOwnerListing(listing) {
  const listings = getStorageItem(OWNER_LISTINGS_KEY, []);
  const nextListing = normalizeOwnerListing({
    ...listing,
    id: listing.id || `owner-listing-${Date.now()}`,
    createdAt: listing.createdAt || new Date().toISOString(),
    expiresAt:
      listing.expiresAt ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    inquiries: listing.inquiries || 0,
    messages: listing.messages || 0,
  });

  writeOwnerListings([
    nextListing,
    ...listings.filter((item) => item.id !== nextListing.id),
  ]);
  window.dispatchEvent(new Event("easterncity:listings-updated"));
  return nextListing;
}

export function deleteOwnerListing(id) {
  writeOwnerListings(
    getStorageItem(OWNER_LISTINGS_KEY, []).filter((item) => item.id !== id),
  );
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

export function getListingPaymentRequests() {
  return getOwnerListings().filter((item) =>
    ["payment pending", "under review", "rejected", "published"].includes(
      normalizeListingStatus(item.status),
    ) || item.listingFeeAmount,
  );
}

export function updateListingPaymentStatus(id, paymentReviewStatus) {
  const status = paymentReviewStatus === "approved" ? "published" : "rejected";
  return updateOwnerListing(id, {
    paymentReviewStatus,
    status,
    available: paymentReviewStatus === "approved",
    reviewedAt: new Date().toISOString(),
  });
}

export function renewOwnerListing(id) {
  return updateOwnerListing(id, {
    status: "renewed",
    available: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  });
}

export function promoteOwnerListing(id, promotion = "Featured Listing", metadata = {}) {
  const promotionType = metadata.promotionType || promotion;
  const promotionPackageId = metadata.promotionPackageId || metadata.packageId || null;
  const promotionPlacement =
    metadata.promotionPlacement ||
    resolvePromotionPlacement(promotionPackageId, promotionType || promotion);

  return updateOwnerListing(id, {
    featured: true,
    status: "featured",
    promotion,
    promotionType,
    promotionPackageId,
    promotionPlacement,
  });
}