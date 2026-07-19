const notificationService = require("../services/notificationService");

const list = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user.id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const sendDirect = async (req, res, next) => {
  try {
    const notification = await notificationService.sendDirectNotification({
      recipient: req.body.recipient,
      title: req.body.title,
      body: req.body.body,
      senderId: req.user.id,
    });

    res.status(201).json({ success: true, message: "Notification sent.", data: notification });
  } catch (error) {
    next(error);
  }
};

const broadcast = async (req, res, next) => {
  try {
    const result = await notificationService.broadcastAnnouncement({
      title: req.body.title,
      body: req.body.body,
      senderId: req.user.id,
    });

    res.status(201).json({ success: true, message: "Announcement sent.", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  markRead,
  markAllRead,
  sendDirect,
  broadcast,
};
