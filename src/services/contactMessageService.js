import {
  createNotification,
  NOTIFICATION_TYPES,
} from "./notificationService.js";
import { apiClient } from "./apiClient.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const CONTACT_MESSAGES_KEY = "easterncity_contact_messages";
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

function emitContactMessagesUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:contact-messages-updated"));
  }
}

function normalizeMessage(message) {
  return {
    id:
      message.id ||
      `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: message.userId || "",
    name: message.name || message.user?.name || "Website Visitor",
    email: message.email || message.user?.email || "",
    subject: message.subject || "Contact message",
    message: message.message || "",
    status: message.status || "OPEN",
    adminReply: message.adminReply || "",
    repliedAt: message.repliedAt || "",
    resolvedAt: message.resolvedAt || "",
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

export function getContactMessages() {
  return getStorageItem(CONTACT_MESSAGES_KEY, []).map(normalizeMessage);
}

export async function fetchContactMessages() {
  if (useMockAuth) {
    return getContactMessages();
  }

  const data = await apiClient.get("/api/contact-messages");
  return Array.isArray(data) ? data.map(normalizeMessage) : [];
}

function saveContactMessages(messages) {
  setStorageItem(CONTACT_MESSAGES_KEY, messages.map(normalizeMessage));
  emitContactMessagesUpdate();
}

export async function createContactMessage(data) {
  if (!useMockAuth) {
    const message = await apiClient.post("/api/contact-messages", data);
    emitContactMessagesUpdate();
    return normalizeMessage(message);
  }

  const message = normalizeMessage({
    ...data,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  });

  saveContactMessages([message, ...getContactMessages()]);
  return message;
}

function findNotificationUserId(message) {
  if (message.userId) return message.userId;

  return "";
}

export async function replyToContactMessage(id, adminReply) {
  if (!useMockAuth) {
    const message = await apiClient.patch(`/api/contact-messages/${id}/reply`, {
      adminReply,
    });
    emitContactMessagesUpdate();
    return normalizeMessage(message);
  }

  let updatedMessage = null;
  const repliedAt = new Date().toISOString();
  const messages = getContactMessages().map((message) => {
    if (message.id !== id) return message;
    updatedMessage = normalizeMessage({
      ...message,
      adminReply,
      repliedAt,
      status: "REPLIED",
    });
    return updatedMessage;
  });

  saveContactMessages(messages);

  const userId = findNotificationUserId(updatedMessage || {});
  if (userId) {
    createNotification({
      userId,
      title: `Reply: ${updatedMessage.subject}`,
      body: adminReply,
      type: NOTIFICATION_TYPES.SUPPORT_REPLY,
      referenceId: updatedMessage.id,
      referenceType: "ContactMessage",
    });
  }

  return updatedMessage;
}

export async function resolveContactMessage(id) {
  if (!useMockAuth) {
    const message = await apiClient.patch(`/api/contact-messages/${id}/resolve`);
    emitContactMessagesUpdate();
    return normalizeMessage(message);
  }

  let updatedMessage = null;
  const resolvedAt = new Date().toISOString();
  const messages = getContactMessages().map((message) => {
    if (message.id !== id) return message;
    updatedMessage = normalizeMessage({
      ...message,
      status: "RESOLVED",
      resolvedAt,
    });
    return updatedMessage;
  });

  saveContactMessages(messages);
  return updatedMessage;
}
