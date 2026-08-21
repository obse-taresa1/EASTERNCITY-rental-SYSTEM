import { apiClient } from "./apiClient.js";

export async function submitAdvertisingRequest(values, bannerFile) {
  const formData = new FormData();
  Object.entries({ ...values, campaignType: "HOMEPAGE_BANNER" }).forEach(([key, value]) => formData.append(key, String(value ?? "")));
  if (bannerFile instanceof File && bannerFile.size > 0) formData.append("banner", bannerFile);
  return apiClient.post("/api/advertising-requests", formData);
}

export async function fetchAdvertisingRequests(status = "") {
  return apiClient.get(`/api/advertising-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`);
}

export async function updateAdvertisingRequest(id, values) {
  return apiClient.patch(`/api/advertising-requests/${id}`, values);
}

export async function uploadAdvertisingPaymentReceipt(reference, email, paymentProof) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("paymentProof", paymentProof);
  return apiClient.post(`/api/advertising-requests/${encodeURIComponent(reference)}/payment-receipt`, formData);
}

export async function getAdvertisingPaymentStatus(reference, email) {
  return apiClient.post(`/api/advertising-requests/${encodeURIComponent(reference)}/payment-status`, { email });
}
