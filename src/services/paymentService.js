import { fetchPromotionRequests } from "./promotionApiService.js";

export const paymentMethods = [
  {
    id: "offline-cash",
    name: "Offline payment between users",
  },
];

export async function processPayment() {
  throw new Error(
    "Rental booking payments are handled physically between users and are not processed by the platform.",
  );
}

export async function fetchPromotionPayments() {
  const promotions = await fetchPromotionRequests();

  return promotions.map((request) => ({
    transactionId: request.id,
    listingId: request.listingId,
    packageId: request.promotionType || request.packageType || request.packageId,
    amount: Number(request.amount || 0),
    success: !["failed", "rejected"].includes(
      String(request.status || "").toLowerCase(),
    ),
    status: request.status || "Pending",
    timestamp: request.createdAt || request.requestDate || request.updatedAt,
  }));
}
