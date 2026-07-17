import { apiClient, resolveAssetUrl } from "./apiClient.js";

function normalizeRequest(request) {
  if (!request) return null;

  return {
    ...request,
    status: String(request.status || "PENDING").toUpperCase(),
    nationalIdFrontUrl: resolveAssetUrl(request.nationalIdFrontUrl),
    nationalIdBackUrl: resolveAssetUrl(request.nationalIdBackUrl),
    submittedAt: request.submittedAt || request.createdAt,
  };
}

export async function submitVerificationRequest(payload) {
  const formData = new FormData();
  formData.append("city", payload.city);
  formData.append("sefer", payload.sefer);
  formData.append("address", payload.address || "");
  formData.append("nationalIdFront", payload.nationalIdFront);
  formData.append("nationalIdBack", payload.nationalIdBack);

  const data = await apiClient.post("/api/verification/me", formData);
  return normalizeRequest(data);
}

export async function getVerificationRequests() {
  const data = await apiClient.get("/api/verification/requests");
  return Array.isArray(data) ? data.map(normalizeRequest) : [];
}

export async function reviewVerificationRequest(id, status, reason = "") {
  const data = await apiClient.patch(`/api/verification/requests/${id}`, {
    status,
    reason,
  });

  return normalizeRequest(data);
}
