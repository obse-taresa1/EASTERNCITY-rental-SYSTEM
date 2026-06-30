const prisma = require('../config/db');

const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  PROMOTION_APPROVED: 'PROMOTION_APPROVED',
  PROMOTION_REJECTED: 'PROMOTION_REJECTED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  SUPPORT_REPLY: 'SUPPORT_REPLY',
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
    orderBy: { createdAt: 'desc' },
  });
};

const markRead = async (id, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found.');
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

const notifyBookingCreated = (booking) =>
  createNotification({
    userId: booking.ownerId,
    title: 'New booking request received',
    body: `${booking.itemTitle || 'A listing'} has a new booking request.`,
    type: NOTIFICATION_TYPES.BOOKING_CREATED,
    referenceId: booking.id,
    referenceType: 'BOOKING',
  });

const notifyBookingAccepted = (booking) =>
  createNotification({
    userId: booking.renterId,
    title: 'Your booking request was accepted',
    body: `${booking.itemTitle || 'Your booking'} was accepted.`,
    type: NOTIFICATION_TYPES.BOOKING_ACCEPTED,
    referenceId: booking.id,
    referenceType: 'BOOKING',
  });

const notifyBookingRejected = (booking) =>
  createNotification({
    userId: booking.renterId,
    title: 'Your booking request was rejected',
    body: `${booking.itemTitle || 'Your booking'} was rejected.`,
    type: NOTIFICATION_TYPES.BOOKING_REJECTED,
    referenceId: booking.id,
    referenceType: 'BOOKING',
  });

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getNotificationsForUser,
  markRead,
  markAllRead,
  notifyBookingCreated,
  notifyBookingAccepted,
  notifyBookingRejected,
};
