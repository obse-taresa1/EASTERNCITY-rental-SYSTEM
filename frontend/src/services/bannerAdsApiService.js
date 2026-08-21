import { apiClient, resolveAssetUrl } from "./apiClient.js";

function normalizeBanner(ad) {
  return {
    ...ad,
    sourceImageUrl: ad?.imageUrl || "",
    imageUrl: resolveAssetUrl(ad?.imageUrl || ""),
    mobileImageUrl: resolveAssetUrl(ad?.mobileImageUrl || ""),
    logoUrl: resolveAssetUrl(ad?.logoUrl || ""),
    headline: ad?.headline || ad?.title || "",
    shortDescription: ad?.shortDescription || ad?.subtitle || "",
    ctaLabel: ad?.ctaLabel || "Learn more",
    ctaUrl: ad?.ctaUrl || "",
  };
}

function buildPayload(values, imageFile) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (imageFile) formData.append("bannerImage", imageFile);
  return formData;
}

export async function fetchActiveBannerAds() {
  const response = await apiClient.get("/api/banner-ads");
  return (response.data || response || []).map(normalizeBanner);
}

export async function fetchManagedBannerAds() {
  const response = await apiClient.get("/api/banner-ads/manage");
  return (response.data || response || []).map(normalizeBanner);
}

export async function updateBannerAd(id, values, imageFile) {
  const data = await apiClient.patch(`/api/banner-ads/${id}`, buildPayload(values, imageFile));
  return normalizeBanner(data);
}

export async function deleteBannerAd(id) {
  return apiClient.delete(`/api/banner-ads/${id}`);
}

export async function trackBannerAdView(id) {
  return apiClient.post(`/api/banner-ads/${id}/view`);
}

export async function trackBannerAdClick(id) {
  return apiClient.post(`/api/banner-ads/${id}/click`);
}
export async function createBannerAd(values, imageFile) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (imageFile instanceof File && imageFile.size > 0) formData.append('bannerImage', imageFile);
  return apiClient.post('/api/banner-ads', formData);
}
