const repository = require("../repositories/conversation.repository");
const listingRepository = require("../repositories/listingRepository");

function isParticipant(conversation, userId) {
  return (
    conversation?.participantOneId === userId ||
    conversation?.participantTwoId === userId
  );
}

async function decorateConversation(conversation, userId) {
  if (!conversation) return null;

  const lastMessage = conversation.messages?.[0] || null;
  const unreadCount = await repository.countUnread(conversation.id, userId);

  return {
    ...conversation,
    messages: undefined,
    lastMessage,
    unreadCount,
  };
}

async function getMyConversations(userId) {
  const conversations = await repository.findManyByUser(userId);
  return Promise.all(
    conversations.map((conversation) => decorateConversation(conversation, userId)),
  );
}

async function getConversationForUser(userId, conversationId) {
  const conversation = await repository.findById(conversationId);

  if (!conversation || !isParticipant(conversation, userId)) {
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  return decorateConversation(conversation, userId);
}

async function findOrCreateConversation(userId, payload) {
  if (userId === payload.participantTwoId) {
    const error = new Error("You cannot start a conversation with yourself.");
    error.statusCode = 400;
    throw error;
  }

  const listing = await listingRepository.findById(payload.listingId);

  if (!listing) {
    const error = new Error("Listing not found.");
    error.statusCode = 404;
    throw error;
  }

  if (listing.ownerId !== payload.participantTwoId) {
    const error = new Error("The selected user is not the owner of this listing.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await repository.findForListingAndParticipants({
    listingId: payload.listingId,
    participantOneId: userId,
    participantTwoId: payload.participantTwoId,
  });

  if (existing) {
    return decorateConversation(existing, userId);
  }

  const conversation = await repository.create({
    participantOneId: userId,
    participantTwoId: payload.participantTwoId,
    listingId: payload.listingId,
    lastMessageAt: null,
  });

  return decorateConversation(conversation, userId);
}

module.exports = {
  getMyConversations,
  getConversationForUser,
  findOrCreateConversation,
  isParticipant,
};
