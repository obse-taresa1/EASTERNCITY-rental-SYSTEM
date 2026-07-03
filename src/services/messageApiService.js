import { apiClient } from "./apiClient.js";

function normalizeListing(listing) {
  if (!listing) return null;

  return {
    ...listing,
    image:
      listing.image ||
      listing.coverImage ||
      listing.images?.[0]?.imageUrl ||
      "",
  };
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
}

function normalizeConversation(conversation) {
  if (!conversation) return null;

  return {
    ...conversation,
    listing: normalizeListing(conversation.listing),
    participantOne: normalizeUser(conversation.participantOne),
    participantTwo: normalizeUser(conversation.participantTwo),
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
  const conversations = await getConversations();
  const conversation =
    conversations.find((entry) => entry.id === conversationId) || null;
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

  await sendMessage({
    conversationId: conversation.id,
    body: "I am interested in this listing.",
  });

  return getConversationById(conversation.id);
}
