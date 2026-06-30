import { getUsers } from "./authService.js";
import { createNotification, NOTIFICATION_TYPES } from "./notificationService.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const CONTACT_MESSAGES_KEY = "easterncity_contact_messages";

function emitContactMessagesUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:contact-messages-updated"));
  }
}

function normalizeMessage(message) {
  return {
    id: message.id || `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: message.userId || "",
    name: message.name || "Website Visitor",
    email: message.email || "",
    subject: message.subject || "Contact message",
    message: message.message || "",
    status: message.status || "Open",
    adminReply: message.adminReply || "",
    repliedAt: message.repliedAt || "",
    resolvedAt: message.resolvedAt || "",
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

export function getContactMessages() {
  return getStorageItem(CONTACT_MESSAGES_KEY, []).map(normalizeMessage);
}

function saveContactMessages(messages) {
  setStorageItem(CONTACT_MESSAGES_KEY, messages.map(normalizeMessage));
  emitContactMessagesUpdate();
}

export function createContactMessage(data) {
  const message = normalizeMessage({
    ...data,
    status: "Open",
    createdAt: new Date().toISOString(),
  });

  saveContactMessages([message, ...getContactMessages()]);
  return message;
}

function findNotificationUserId(message) {
  if (message.userId) return message.userId;

  const email = String(message.email || "").toLowerCase();
  if (!email) return "";

  return getUsers().find((user) => user.email?.toLowerCase() === email)?.id || "";
}

export function replyToContactMessage(id, adminReply) {
  let updatedMessage = null;
  const repliedAt = new Date().toISOString();
  const messages = getContactMessages().map((message) => {
    if (message.id !== id) return message;
    updatedMessage = normalizeMessage({
      ...message,
      adminReply,
      repliedAt,
      status: "Replied",
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

export function resolveContactMessage(id) {
  let updatedMessage = null;
  const resolvedAt = new Date().toISOString();
  const messages = getContactMessages().map((message) => {
    if (message.id !== id) return message;
    updatedMessage = normalizeMessage({
      ...message,
      status: "Resolved",
      resolvedAt,
    });
    return updatedMessage;
  });

  saveContactMessages(messages);
  return updatedMessage;
}