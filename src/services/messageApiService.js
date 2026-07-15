import { apiClient } from "./apiClient.js";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  "http://localhost:5000";

function resolveAssetUrl(value) {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function normalizeListing(listing) {
  if (!listing) return null;

  const images = Array.isArray(listing.images) ? listing.images : [];
  const image =
    listing.image ||
    listing.coverImage ||
    images[0]?.imageUrl ||
    "";

  return {
    ...listing,
    image: resolveAssetUrl(image),
    coverImage: resolveAssetUrl(image),
  };
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    profileImage: resolveAssetUrl(user.profileImage || user.avatarUrl || ""),
  };
}

function normalizeConversation(conversation) {
  if (!conversation) return null;

  return {
    ...conversation,
    listing: normalizeListing(conversation.listing),
    participantOne: normalizeUser(conversation.participantOne),
    participantTwo: normalizeUser(conversation.participantTwo),
    lastMessage: normalizeMessage(conversation.lastMessage),
    unreadCount: Number(conversation.unreadCount || 0),
  };
}

function normalizeMessage(message) {
  if (!message) return null;
  return {
    ...message,
    sender: normalizeUser(message.sender),
  };
}

export async function getConversations() {
  const data = await apiClient.get("/api/conversations");
  return Array.isArray(data) ? data.map(normalizeConversation) : [];
}

export async function getConversationById(conversationId) {
  if (!conversationId) return null;
  const conversation = normalizeConversation(
    await apiClient.get(`/api/conversations/${conversationId}`),
  );
  if (!conversation) return null;

  try {
    const messages = await apiClient.get(`/api/messages/${conversationId}`);
    return {
      ...conversation,
      messages: Array.isArray(messages) ? messages.map(normalizeMessage) : [],
    };
  } catch {
    return {
      ...conversation,
      messages: [],
    };
  }
}

export async function createConversation({ participantTwoId, listingId }) {
  const data = await apiClient.post("/api/conversations", {
    participantTwoId,
    listingId,
  });
  return normalizeConversation(data);
}

export async function sendMessage({ conversationId, body }) {
  const data = await apiClient.post("/api/messages", {
    conversationId,
    body,
  });
  return normalizeMessage(data);
}

export async function startListingConversation({ renter, item }) {
  if (!renter?.id || !item?.id) {
    throw new Error(
      "A signed-in renter and listing are required to contact the owner.",
    );
  }

  const conversation = await createConversation({
    participantTwoId: item.ownerId,
    listingId: item.id,
  });

  return getConversationById(conversation.id);
}
