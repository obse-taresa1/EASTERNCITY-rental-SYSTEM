const repository = require("../repositories/contactMessage.repository");
const notificationService = require("../services/notificationService");

async function createMessage(req, res, next) {
  try {
    const data = await repository.create({
      userId: req.user?.id || null,
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      status: "OPEN",
    });

    res.status(201).json({ success: true, message: "Contact message submitted.", data });
  } catch (error) {
    next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const data = await repository.findAll();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function replyToMessage(req, res, next) {
  try {
    const data = await repository.update(req.params.id, {
      adminReply: req.body.adminReply,
      status: "REPLIED",
      repliedAt: new Date(),
    });

    if (data.userId) {
      await notificationService.createNotification({
        userId: data.userId,
        title: `Reply: ${data.subject}`,
        body: req.body.adminReply,
        type: notificationService.NOTIFICATION_TYPES.SUPPORT_REPLY,
        referenceId: data.id,
        referenceType: "CONTACT_MESSAGE",
      });
    }

    res.json({ success: true, message: "Reply sent.", data });
  } catch (error) {
    next(error);
  }
}

async function resolveMessage(req, res, next) {
  try {
    const data = await repository.update(req.params.id, {
      status: "RESOLVED",
      resolvedAt: new Date(),
    });

    res.json({ success: true, message: "Contact message resolved.", data });
  } catch (error) {
    next(error);
  }
}

module.exports = { createMessage, listMessages, replyToMessage, resolveMessage };
