const { randomUUID } = require("crypto");
const prisma = require("../config/db");

const SETTING_KEY = "homepageBannerAds";

function parseAds(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getAllBannerAds() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
  return parseAds(setting?.value);
}

function isCurrentlyActive(ad, now = new Date()) {
  if (!ad?.isActive || !ad.imageUrl) return false;
  const start = ad.startDate ? new Date(`${ad.startDate}T00:00:00`) : null;
  const end = ad.endDate ? new Date(`${ad.endDate}T23:59:59`) : null;
  return (!start || start <= now) && (!end || end >= now);
}

async function getActiveBannerAds() {
  return (await getAllBannerAds())
    .filter((ad) => isCurrentlyActive(ad))
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

function buildBannerAd(payload, imageUrl, current = {}) {
  const title = String(payload.title ?? current.title ?? "").trim();
  if (!title) throw new Error("Banner title is required.");

  const nextImageUrl = imageUrl || String(payload.imageUrl ?? current.imageUrl ?? "").trim();
  if (!nextImageUrl) throw new Error("Upload a banner image or provide an image URL.");

  const ctaUrl = String(payload.ctaUrl ?? current.ctaUrl ?? "").trim();
  if (ctaUrl && !/^(https?:\/\/|\/)/i.test(ctaUrl)) {
    throw new Error("Banner link must start with https://, http://, or /.");
  }

  return {
    ...current,
    id: current.id || randomUUID(),
    companyName: String(payload.companyName ?? current.companyName ?? "" ).trim(),
    title,
    subtitle: String(payload.subtitle ?? current.subtitle ?? "").trim(),
    imageUrl: nextImageUrl,
    ctaLabel: String(payload.ctaLabel ?? current.ctaLabel ?? "Learn more").trim() || "Learn more",
    ctaUrl,
    displayOrder: Number(payload.displayOrder ?? current.displayOrder ?? 0) || 0,
    startDate: String(payload.startDate ?? current.startDate ?? "").trim(),
    endDate: String(payload.endDate ?? current.endDate ?? "").trim(),
    isActive: String(payload.isActive ?? current.isActive ?? "true") === "true",
    updatedAt: new Date().toISOString(),
  };
}

async function recordBannerEvent(id, event) {
  const ads = await getAllBannerAds();
  const index = ads.findIndex((ad) => ad.id === id);
  if (index < 0) throw new Error("Banner advertisement was not found.");

  const now = new Date().toISOString();
  const ad = ads[index];
  if (event === "click") {
    ad.clicks = Number(ad.clicks || 0) + 1;
    ad.lastClickedAt = now;
  } else {
    ad.views = Number(ad.views || 0) + 1;
    ad.lastViewedAt = now;
  }
  ads[index] = ad;
  await persistBannerAds({ id: ad.updatedById || null }, ads);
  return { id, views: ad.views || 0, clicks: ad.clicks || 0 };
}

async function persistBannerAds(actor, ads) {
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(ads), updatedById: actor.id },
    create: { key: SETTING_KEY, value: JSON.stringify(ads), updatedById: actor.id },
  });
  return ads;
}

async function createBannerAd(actor, payload, file) {
  const ads = await getAllBannerAds();
  // Advertising requests already store their uploaded artwork. Reuse that
  // image when an approved request is published, rather than requiring a
  // second upload from the admin dashboard.
  const imageUrl = file
    ? `/uploads/banners/${file.filename}`
    : String(payload.imageUrl || "").trim();
  const banner = buildBannerAd(payload, imageUrl);
  ads.unshift({ ...banner, createdAt: new Date().toISOString() });
  await persistBannerAds(actor, ads);
  return banner;
}

async function updateBannerAd(actor, id, payload, file) {
  const ads = await getAllBannerAds();
  const index = ads.findIndex((ad) => ad.id === id);
  if (index < 0) throw new Error("Banner advertisement was not found.");
  const imageUrl = file ? `/uploads/banners/${file.filename}` : "";
  ads[index] = buildBannerAd(payload, imageUrl, ads[index]);
  await persistBannerAds(actor, ads);
  return ads[index];
}

async function deleteBannerAd(actor, id) {
  const ads = await getAllBannerAds();
  const nextAds = ads.filter((ad) => ad.id !== id);
  if (nextAds.length === ads.length) throw new Error("Banner advertisement was not found.");
  await persistBannerAds(actor, nextAds);
  return { id };
}

module.exports = {
  createBannerAd,
  deleteBannerAd,
  getActiveBannerAds,
  getAllBannerAds,
  recordBannerEvent,
  updateBannerAd,
};
