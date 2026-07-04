import { apiClient } from "./apiClient.js";
import { getMyListings } from "./listingApiService.js";

function normalizeStatus(status) {
  const value = String(status || "pending").toLowerCase();
  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "featured") return "Approved";
  return "Pending";
}

function normalizePromotion(promotion) {
  if (!promotion) return null;

  return {
    ...promotion,
    id: promotion.id,
    listingId: promotion.listingId,
    listingTitle:
      promotion.listingTitle ||
      promotion.listing?.title ||
      promotion.title ||
      "Listing",
    userId: promotion.userId,
    ownerId: promotion.userId || promotion.ownerId,
    userName:
      promotion.userName ||
      promotion.ownerName ||
      promotion.user?.name ||
      promotion.listing?.owner?.name ||
      "User",
    ownerName:
      promotion.ownerName ||
      promotion.userName ||
      promotion.user?.name ||
      promotion.listing?.owner?.name ||
      "User",
    promotionType:
      promotion.packageType || promotion.promotionType || promotion.packageName,
    promotionPlacement: promotion.placement || promotion.promotionPlacement,
    requestDate:
      promotion.createdAt || promotion.requestDate || promotion.updatedAt || "",
    screenshotName: promotion.paymentProofUrl
      ? promotion.paymentProofUrl.split("/").pop()
      : promotion.screenshotName,
    screenshotUrl: promotion.paymentProofUrl || promotion.screenshotUrl || "",
    amount: Number(promotion.amount || 0),
    status: normalizeStatus(promotion.status),
  };
}

export async function fetchOwnerListings(ownerId) {
  const listings = await getMyListings();
  return listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    ownerId: listing.ownerId,
    ownerName: listing.ownerName || listing.owner?.name || "",
  }));
}

export async function requestPromotion(
  listingId,
  packageId,
  screenshotFile,
  metadata = {},
) {
  const formData = new FormData();
  formData.append("listingId", listingId);
  formData.append(
    "packageType",
    metadata.packageName || metadata.promotionType || "Promotion Package",
  );
  formData.append("placement", metadata.promotionPlacement || "featured");
  formData.append("amount", String(metadata.amount || 0));
  formData.append("paymentType", metadata.paymentMethod || "PROMOTION_FEE");

  if (screenshotFile?.file) {
    formData.append("paymentProof", screenshotFile.file);
  }

  const data = await apiClient.post("/api/promotions", formData);
  return normalizePromotion(data);
}

export async function fetchPromotionRequests() {
  const data = await apiClient.get("/api/promotions");
  return Array.isArray(data) ? data.map(normalizePromotion) : [];
}

export async function fetchPendingPromotionRequests() {
  const data = await apiClient.get("/api/promotions/pending");
  return Array.isArray(data) ? data.map(normalizePromotion) : [];
}

export async function fetchOwnerPromotions(ownerId) {
  const requests = await fetchPromotionRequests();
  return requests.filter((promotion) => {
    if (!ownerId) return true;
    return (
      String(promotion.userId || promotion.ownerId || "") === String(ownerId)
    );
  });
}

export async function approvePromotionRequest(id) {
  const data = await apiClient.patch(`/api/promotions/${id}/approve`);
  return normalizePromotion(data);
}

export async function rejectPromotionRequest(id) {
  const data = await apiClient.patch(`/api/promotions/${id}/reject`, {
    reason: "Rejected by admin.",
  });
  return normalizePromotion(data);
}

export async function fetchActivePromotions() {
  const all = await fetchPromotionRequests();
  return Array.isArray(all)
    ? all.filter((p) => String(p.status || "").toLowerCase() === "approved")
    : [];
}
