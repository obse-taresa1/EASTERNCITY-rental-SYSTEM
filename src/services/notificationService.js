import { apiClient } from "./apiClient.js";
import { getAuthTokens } from "./authService.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const NOTIFICATIONS_KEY = "easterncity_notifications";

export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_ACCEPTED: "BOOKING_ACCEPTED",
  BOOKING_REJECTED: "BOOKING_REJECTED",
  LISTING_APPROVED: "LISTING_APPROVED",
  LISTING_REJECTED: "LISTING_REJECTED",
  PAYMENT_APPROVED: "PAYMENT_APPROVED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  PROMOTION_APPROVED: "PROMOTION_APPROVED",
  PROMOTION_REJECTED: "PROMOTION_REJECTED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  SUPPORT_REPLY: "SUPPORT_REPLY",
  REVIEW_ADDED: "REVIEW_ADDED",
  ADMIN_NOTICE: "ADMIN_NOTICE",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
};

export function getNotifications() {
  return useMockAuth ? getStorageItem(NOTIFICATIONS_KEY, []) : [];
}

export function getNotificationsByUser(userId) {
  if (!userId) return [];
  return getNotifications()
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function fetchNotifications(userId) {
  const accessToken = getAuthTokens().accessToken;

  if (useMockAuth || !accessToken) {
    return getNotificationsByUser(userId);
  }

  const data = await apiClient.get("/api/notifications");
  return Array.isArray(data) ? data : [];
}

export function createNotification({
  userId,
  title,
  body,
  type,
  referenceId = "",
  referenceType = "",
}) {
  if (!userId || !title || !body || !type) {
    return null;
  }

  const notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    title,
    body,
    type,
    referenceId,
    referenceType,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (useMockAuth) {
    setStorageItem(NOTIFICATIONS_KEY, [notification, ...getNotifications()]);
  }
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notification;
}

export async function sendDirectNotification({ recipient, title, body }) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const notification = await apiClient.post("/api/notifications", {
      recipient,
      title,
      body,
    });
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return notification;
  }

  const notification = createNotification({
    userId: recipient,
    title,
    body,
    type: NOTIFICATION_TYPES.ADMIN_NOTICE,
    referenceType: "ADMIN",
  });
  return notification;
}

export async function sendBroadcastNotification({ title, body }) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const result = await apiClient.post("/api/notifications/broadcast", {
      title,
      body,
    });
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return result;
  }

  return { count: 0 };
}

export async function markNotificationRead(id) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const notification = await apiClient.patch(`/api/notifications/${id}/read`);
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return notification;
  }

  const notifications = getNotifications().map((notification) =>
    notification.id === id ? { ...notification, isRead: true } : notification,
  );
  if (useMockAuth) setStorageItem(NOTIFICATIONS_KEY, notifications);
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notifications.find((notification) => notification.id === id) || null;
}

export async function markAllNotificationsRead() {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const result = await apiClient.patch("/api/notifications/read-all");
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return result;
  }

  const notifications = getNotifications().map((notification) => ({
    ...notification,
    isRead: true,
  }));
  if (useMockAuth) setStorageItem(NOTIFICATIONS_KEY, notifications);
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notifications;
}
