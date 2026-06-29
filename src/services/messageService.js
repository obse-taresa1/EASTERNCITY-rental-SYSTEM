import { getStorageItem, setStorageItem } from "./storageService.js";

const CONVERSATIONS_KEY = "easterncity_conversations";

export function getConversations(userId) {
  const conversations = getStorageItem(CONVERSATIONS_KEY, []);
  if (!userId) return conversations;

  return conversations.filter((conversation) =>
    conversation.participants?.some((participant) => participant.id === userId),
  );
}

export function getConversationById(conversationId) {
  return getStorageItem(CONVERSATIONS_KEY, []).find((conversation) => conversation.id === conversationId) || null;
}

export function startListingConversation({ renter, item }) {
  if (!renter?.id || !item?.id) {
    throw new Error("A signed-in renter and listing are required to contact the owner.");
  }

  const conversations = getStorageItem(CONVERSATIONS_KEY, []);
  const ownerName = item.ownerName || item.owner || "EasternCity Owner";
  const ownerId = `owner-${String(ownerName).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const subject = `${item.title} for Rent`;

  const existingConversation = conversations.find(
    (conversation) =>
      conversation.itemId === item.id &&
      conversation.participants?.some((participant) => participant.id === renter.id) &&
      conversation.participants?.some((participant) => participant.id === ownerId),
  );

  if (existingConversation) {
    return existingConversation;
  }

  const now = new Date().toISOString();
  const conversation = {
    id: `conversation-${Date.now()}`,
    itemId: item.id,
    subject,
    context: "I am interested in this listing.",
    listing: {
      id: item.id,
      title: item.title,
      image: item.image,
      price: item.price,
      pricePerDay: item.pricePerDay,
      location: item.location,
    },
    participants: [
      { id: renter.id, name: renter.name || "User", role: "USER" },
      { id: ownerId, name: ownerName, role: "owner" },
    ],
    messages: [
      {
        id: `message-${Date.now()}`,
        senderId: renter.id,
        senderName: renter.name || "Renter",
        body: "I am interested in this listing.",
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  setStorageItem(CONVERSATIONS_KEY, [conversation, ...conversations]);
  return conversation;
}
