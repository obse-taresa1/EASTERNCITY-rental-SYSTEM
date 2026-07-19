import { apiClient } from "./apiClient.js";
import { getAuthTokens } from "./authService.js";

function normalizeReview(review) {
  if (!review) return null;

  return {
    id: review.id,
    reviewerId: review.userId || review.reviewerId || "",
    userId: review.userId || review.reviewerId || "",
    userName:
      review.user?.name ||
      review.userName ||
      review.reviewerName ||
      "Verified renter",
    listingId: review.listingId || review.itemId || "",
    itemId: review.listingId || review.itemId || "",
    bookingId: review.bookingId,
    rating: Number(review.rating || 0),
    comment: review.comment || "",
    listing: review.listing || null,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function resolveMockListingId(listingId, review) {
  return listingId || review?.listingId || review?.itemId || "";
}

export async function getReviewsByListing(listingId) {
  if (!listingId) return [];
  const data = await apiClient.get(`/api/reviews/${listingId}`);
  return Array.isArray(data) ? data.map(normalizeReview) : [];
}

export async function getReviewsByListings(listingIds = []) {
  const uniqueIds = [...new Set(listingIds.filter(Boolean).map(String))];
  const entries = await Promise.all(
    uniqueIds.map(async (listingId) => [
      listingId,
      await getReviewsByListing(listingId),
    ]),
  );

  return Object.fromEntries(entries);
}

export async function submitReview(payload) {
  const data = await apiClient.post("/api/reviews", {
    listingId: payload.listingId,
    bookingId: payload.bookingId,
    rating: payload.rating,
    comment: payload.comment,
  });

  return normalizeReview(data);
}

export async function getMyReviews() {
  const data = await apiClient.get("/api/reviews/my");
  return Array.isArray(data) ? data.map(normalizeReview) : [];
}

export async function getAllReviews() {
  const data = await apiClient.get("/api/reviews");
  return Array.isArray(data) ? data.map(normalizeReview) : [];
}
