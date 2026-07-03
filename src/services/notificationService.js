import { apiClient } from "./apiClient.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

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
};

export function getNotifications() {
  return getStorageItem(NOTIFICATIONS_KEY, []);
}

export function getNotificationsByUser(userId) {
  if (!userId) return [];
  return getNotifications()
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function fetchNotifications(userId) {
  const accessToken = getStorageItem("accessToken", null);

  if (!accessToken) {
    return getNotificationsByUser(userId);
  }

  return apiClient.get("/api/notifications");
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

  setStorageItem(NOTIFICATIONS_KEY, [notification, ...getNotifications()]);
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notification;
}

export async function markNotificationRead(id) {
  const accessToken = getStorageItem("accessToken", null);

  if (accessToken) {
    const notification = await apiClient.patch(`/api/notifications/${id}/read`);
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return notification;
  }

  const notifications = getNotifications().map((notification) =>
    notification.id === id ? { ...notification, isRead: true } : notification,
  );
  setStorageItem(NOTIFICATIONS_KEY, notifications);
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notifications.find((notification) => notification.id === id) || null;
}

export async function markAllNotificationsRead() {
  const accessToken = getStorageItem("accessToken", null);

  if (accessToken) {
    const result = await apiClient.patch("/api/notifications/read-all");
    window.dispatchEvent(new Event("easterncity:notifications-updated"));
    return result;
  }

  const notifications = getNotifications().map((notification) => ({
    ...notification,
    isRead: true,
  }));
  setStorageItem(NOTIFICATIONS_KEY, notifications);
  window.dispatchEvent(new Event("easterncity:notifications-updated"));
  return notifications;
}
