import { promotionPackages } from "../data/promotions.js";
import { getAllItems, promoteOwnerListing } from "./itemService.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

export const PROMOTION_REQUESTS_KEY = "easterncity_promotion_requests";

const STATUS_LABELS = {
  pending: "Pending",
  "pending review": "Pending",
  approved: "Approved",
  active: "Approved",
  rejected: "Rejected",
  deactivated: "Rejected",
};

function emitPromotionUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:promotions-updated"));
  }
}

function readPromotionRequests() {
  const stored = getStorageItem(PROMOTION_REQUESTS_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function writePromotionRequests(requests) {
  setStorageItem(PROMOTION_REQUESTS_KEY, Array.isArray(requests) ? requests : []);
  emitPromotionUpdate();
}

function normalizeStatus(status) {
  const key = String(status || "Pending").toLowerCase();
  return STATUS_LABELS[key] || status || "Pending";
}

function getPackage(packageId) {
  return promotionPackages.find((pkg) => pkg.id === Number(packageId));
}

function getListingSnapshot(listingId) {
  return getAllItems().find((item) => String(item.id) === String(listingId));
}

function normalizePromotionRequest(request) {
  const selectedPackage = getPackage(request.packageId);
  const listing = getListingSnapshot(request.listingId);
  const ownerName =
    request.userName ||
    request.ownerName ||
    listing?.ownerName ||
    listing?.owner ||
    "User";

  return {
    ...request,
    id: request.id || `promo-req-${Date.now()}`,
    listingId: request.listingId || listing?.id || "",
    listingTitle:
      request.listingTitle ||
      request.title ||
      listing?.title ||
      "Listing",
    ownerId: request.ownerId || request.userId || listing?.ownerId || "",
    userId: request.userId || request.ownerId || listing?.ownerId || "",
    userName: ownerName,
    ownerName,
    packageId: Number(request.packageId || selectedPackage?.id || 0),
    packageName:
      request.packageName ||
      request.packageType ||
      request.promotionType ||
      selectedPackage?.name ||
      "Promotion Package",
    promotionType:
      request.promotionType ||
      request.packageName ||
      request.packageType ||
      selectedPackage?.name ||
      "Promotion Package",
    durationDays: Number(request.durationDays || selectedPackage?.days || 0),
    amount: Number(request.amount || request.revenue || selectedPackage?.amount || 0),
    requestDate:
      request.requestDate || new Date().toISOString().slice(0, 10),
    status: normalizeStatus(request.status),
    screenshotName:
      request.screenshotName || request.proof || "promotion-payment-screenshot",
    screenshotUrl: request.screenshotUrl || "",
  };
}

export function fetchOwnerListings(ownerId) {
  const storedListings = getAllItems().filter(
    (item) =>
      item.ownerId === ownerId ||
      item.userId === ownerId ||
      item.owner === ownerId ||
      item.ownerName === ownerId,
  );

  if (storedListings.length) {
    return storedListings.map((item) => ({
      id: item.id,
      title: item.title,
      ownerId,
      ownerName: item.ownerName || item.owner,
    }));
  }

  return [
    { id: "list-1", title: "Camera Rental", ownerId },
    { id: "list-2", title: "Speaker System", ownerId },
    { id: "list-3", title: "Toyota Corolla", ownerId },
  ];
}

export function requestPromotion(
  listingId,
  packageId,
  screenshotFile,
  metadata = {},
) {
  const selectedPackage = getPackage(packageId);
  const listing = getListingSnapshot(listingId);
  const ownerId = metadata.ownerId || metadata.userId || listing?.ownerId || "";
  const userName =
    metadata.userName ||
    metadata.ownerName ||
    listing?.ownerName ||
    listing?.owner ||
    "User";
  const durationDays = Number(
    metadata.durationDays || selectedPackage?.days || 0,
  );
  const amount = Number(
    metadata.amount || selectedPackage?.amount || 0,
  );

  const request = normalizePromotionRequest({
    id: `promo-req-${Date.now()}`,
    listingId,
    listingTitle: metadata.listingTitle || metadata.title || listing?.title,
    ownerId,
    userId: metadata.userId || ownerId,
    userName,
    ownerName: userName,
    packageId: Number(packageId),
    packageName: metadata.packageName || selectedPackage?.name,
    promotionType:
      metadata.promotionType || metadata.packageName || selectedPackage?.name,
    durationDays,
    amount,
    requestDate: new Date().toISOString().slice(0, 10),
    status: "Pending",
    startDate: null,
    endDate: null,
    screenshotName: screenshotFile?.name || "promotion-payment-screenshot",
    screenshotUrl: screenshotFile?.preview || "",
    paymentMethod: metadata.paymentMethod || "",
  });

  const requests = readPromotionRequests();
  writePromotionRequests([request, ...requests]);
  console.log("Promotion Request Created:", request);
  console.log("Promotion Requests Stored:", [request, ...requests]);

  return Promise.resolve({
    success: true,
    message: "Request submitted",
    request,
  });
}

export function fetchOwnerPromotions(ownerId) {
  const requests = fetchPromotionRequests();
  const ownerRequests = requests.filter((promotion) => {
    if (!ownerId) return true;
    return (
      String(promotion.ownerId || "") === String(ownerId) ||
      String(promotion.userId || "") === String(ownerId) ||
      String(promotion.ownerName || "") === String(ownerId) ||
      String(promotion.userName || "") === String(ownerId)
    );
  });

  console.log("Owner Promotion Requests Loaded:", { ownerId, ownerRequests });
  return ownerRequests;
}

export function fetchPromotionRequests() {
  const requests = readPromotionRequests()
    .map(normalizePromotionRequest)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));

  console.log("Promotion Requests Loaded:", requests);
  return requests;
}

export function updatePromotionRequestStatus(id, status) {
  const nextStatus = normalizeStatus(status);
  const now = new Date();
  const requests = readPromotionRequests();
  let updatedRequest = null;

  const next = requests.map((request) => {
    if (request.id !== id) return request;

    updatedRequest = normalizePromotionRequest({
      ...request,
      status: nextStatus,
      reviewedAt: now.toISOString(),
      startDate:
        nextStatus === "Approved"
          ? now.toISOString().slice(0, 10)
          : request.startDate,
      endDate:
        nextStatus === "Approved"
          ? new Date(
              now.getTime() +
                Number(request.durationDays || 0) * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .slice(0, 10)
          : request.endDate,
    });

    return updatedRequest;
  });

  writePromotionRequests(next);

  if (nextStatus === "Approved" && updatedRequest?.listingId) {
    promoteOwnerListing(
      updatedRequest.listingId,
      `${updatedRequest.promotionType} - ${updatedRequest.durationDays} Days`,
    );
  }

  console.log("Promotion Request Status Updated:", {
    id,
    status: nextStatus,
    request: updatedRequest,
  });

  return updatedRequest;
}

export function approvePromotionRequest(id) {
  return updatePromotionRequestStatus(id, "Approved");
}

export function rejectPromotionRequest(id) {
  return updatePromotionRequestStatus(id, "Rejected");
}

export function fetchActivePromotions() {
  return fetchPromotionRequests().filter(
    (request) => request.status === "Approved",
  );
}
