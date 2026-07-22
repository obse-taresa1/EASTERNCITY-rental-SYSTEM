import { apiClient } from "./apiClient.js";
import { getAuthTokens } from "./authService.js";
import { getStorageItem, setStorageItem } from "./storageService.js";

const SUPPORT_TICKETS_KEY = "support_tickets";
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

function normalizeTicket(ticket) {
  return {
    id: ticket.id || `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: ticket.userId || "",
    name: ticket.user?.name || ticket.name || "User",
    email: ticket.user?.email || ticket.email || "",
    type: "User Request",
    subject: ticket.subject || "Support ticket",
    message: ticket.message || "",
    priority: ticket.priority || "MEDIUM",
    status: ticket.status || "OPEN",
    date: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "",
    createdAt: ticket.createdAt || new Date().toISOString(),
    updatedAt: ticket.updatedAt || ticket.createdAt || new Date().toISOString(),
    resolvedAt: ticket.resolvedAt || "",
    replies: ticket.replies || [],
  };
}

export async function createSupportTicket({ subject, message, priority = "MEDIUM" }) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const ticket = await apiClient.post("/api/support-tickets", {
      subject,
      message,
      priority,
    });
    return normalizeTicket(ticket);
  }

  const ticket = normalizeTicket({ subject, message, priority });
  const tickets = getStorageItem(SUPPORT_TICKETS_KEY, []);
  setStorageItem(SUPPORT_TICKETS_KEY, [ticket, ...tickets]);
  return ticket;
}

export async function fetchMySupportTickets() {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const tickets = await apiClient.get("/api/support-tickets/my");
    return Array.isArray(tickets) ? tickets.map(normalizeTicket) : [];
  }

  return getStorageItem(SUPPORT_TICKETS_KEY, []).map(normalizeTicket);
}

export async function fetchSupportTickets() {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const tickets = await apiClient.get("/api/support-tickets");
    return Array.isArray(tickets) ? tickets.map(normalizeTicket) : [];
  }

  return getStorageItem(SUPPORT_TICKETS_KEY, []).map(normalizeTicket);
}

export async function replyToSupportTicket(id, message) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const ticket = await apiClient.post(`/api/support-tickets/${id}/replies`, { message });
    return normalizeTicket(ticket);
  }

  return null;
}

export async function resolveSupportTicket(id) {
  const accessToken = getAuthTokens().accessToken;

  if (!useMockAuth && accessToken) {
    const ticket = await apiClient.patch(`/api/support-tickets/${id}/resolve`);
    return normalizeTicket(ticket);
  }

  const tickets = getStorageItem(SUPPORT_TICKETS_KEY, []).map((ticket) =>
    ticket.id === id ? { ...ticket, status: "RESOLVED", resolvedAt: new Date().toISOString() } : ticket,
  );
  setStorageItem(SUPPORT_TICKETS_KEY, tickets);
  return tickets.find((ticket) => ticket.id === id) || null;
}
