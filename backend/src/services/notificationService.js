const prisma = require("../config/db");

const NOTIFICATION_TYPES = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_ACCEPTED: "BOOKING_ACCEPTED",
  BOOKING_REJECTED: "BOOKING_REJECTED",
  LISTING_APPROVED: "LISTING_APPROVED",
  LISTING_REJECTED: "LISTING_REJECTED",
  PROMOTION_APPROVED: "PROMOTION_APPROVED",
  PROMOTION_REJECTED: "PROMOTION_REJECTED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  SUPPORT_REPLY: "SUPPORT_REPLY",
  REVIEW_ADDED: "REVIEW_ADDED",
  ADMIN_NOTICE: "ADMIN_NOTICE",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
};

const createNotification = async ({
  userId,
  title,
  body,
  type,
  referenceId,
  referenceType,
}) => {
  if (!userId || !title || !body || !type) return null;

  return prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
    },
  });
};

const getNotificationsForUser = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const markRead = async (id, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

const markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const sendDirectNotification = async ({ recipient, title, body, senderId }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: recipient }, { email: recipient }],
    },
  });

  if (!user) {
    const error = new Error("Recipient user not found.");
    error.statusCode = 404;
    throw error;
  }

  return createNotification({
    userId: user.id,
    title,
    body,
    type: NOTIFICATION_TYPES.ADMIN_NOTICE,
    referenceId: senderId,
    referenceType: "ADMIN",
  });
};

const broadcastAnnouncement = async ({ title, body, senderId }) => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });

  if (!users.length) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title,
      body,
      type: NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT,
      referenceId: senderId,
      referenceType: "ADMIN",
    })),
  });
};

const notifyBookingCreated = (booking) =>
  createNotification({
    userId: booking.ownerId,
    title: "New booking request received",
    body: `${booking.itemTitle || "A listing"} has a new booking request.`,
    type: NOTIFICATION_TYPES.BOOKING_CREATED,
    referenceId: booking.id,
    referenceType: "BOOKING",
  });

const notifyBookingAccepted = (booking) =>
  createNotification({
    userId: booking.renterId,
    title: "Your booking request was accepted",
    body: `${booking.itemTitle || "Your booking"} was accepted.`,
    type: NOTIFICATION_TYPES.BOOKING_ACCEPTED,
    referenceId: booking.id,
    referenceType: "BOOKING",
  });

const notifyBookingRejected = (booking) =>
  createNotification({
    userId: booking.renterId,
    title: "Your booking request was rejected",
    body: `${booking.itemTitle || "Your booking"} was rejected.`,
    type: NOTIFICATION_TYPES.BOOKING_REJECTED,
    referenceId: booking.id,
    referenceType: "BOOKING",
  });

const notifyListingApproved = (listing) =>
  createNotification({
    userId: listing.ownerId,
    title: "Your listing was approved",
    body: `${listing.title || "Your listing"} is now visible on the platform.`,
    type: NOTIFICATION_TYPES.LISTING_APPROVED,
    referenceId: listing.id,
    referenceType: "LISTING",
  });

const notifyListingRejected = (listing, reason) =>
  createNotification({
    userId: listing.ownerId,
    title: "Your listing was rejected",
    body: `${listing.title || "Your listing"} was rejected${reason ? `: ${reason}` : "."}`,
    type: NOTIFICATION_TYPES.LISTING_REJECTED,
    referenceId: listing.id,
    referenceType: "LISTING",
  });

const notifyPromotionApproved = (promotion) =>
  createNotification({
    userId: promotion.userId,
    title: "Your promotion was approved",
    body: `${promotion.listing?.title || promotion.listingTitle || "Your listing"} has been promoted.`,
    type: NOTIFICATION_TYPES.PROMOTION_APPROVED,
    referenceId: promotion.id,
    referenceType: "PROMOTION",
  });

const notifyPromotionRejected = (promotion) =>
  createNotification({
    userId: promotion.userId,
    title: "Your promotion was rejected",
    body: `${promotion.listing?.title || promotion.listingTitle || "Your listing"} promotion request was rejected.`,
    type: NOTIFICATION_TYPES.PROMOTION_REJECTED,
    referenceId: promotion.id,
    referenceType: "PROMOTION",
  });

const notifyMessageReceived = (message, conversation, recipientId) =>
  createNotification({
    userId: recipientId,
    title: "New message received",
    body: message.body || "You have a new message.",
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    referenceId: conversation?.id || message.id,
    referenceType: "CONVERSATION",
  });

const notifyReviewAdded = (review, listingTitle, ownerId) =>
  createNotification({
    userId: ownerId,
    title: "New review received",
    body: `${listingTitle || "Your listing"} received a new review.`,
    type: NOTIFICATION_TYPES.REVIEW_ADDED,
    referenceId: review.id,
    referenceType: "REVIEW",
  });

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getNotificationsForUser,
  markRead,
  markAllRead,
  sendDirectNotification,
  broadcastAnnouncement,
  notifyBookingCreated,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyListingApproved,
  notifyListingRejected,
  notifyPromotionApproved,
  notifyPromotionRejected,
  notifyMessageReceived,
  notifyReviewAdded,
};
