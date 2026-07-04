const repository = require("../repositories/supportTicket.repository");
const notificationService = require("../services/notificationService");

async function createTicket(req, res, next) {
  try {
    const data = await repository.create({
      userId: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
      priority: req.body.priority || "MEDIUM",
    });

    res
      .status(201)
      .json({ success: true, message: "Support ticket created.", data });
  } catch (error) {
    next(error);
  }
}

async function getMyTickets(req, res, next) {
  try {
    const data = await repository.findManyByUser(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getAllTickets(req, res, next) {
  try {
    const data = await repository.findAll();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function replyToTicket(req, res, next) {
  try {
    const ticket = await repository.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found." });
    }

    const reply = await repository.createReply({
      ticketId: ticket.id,
      userId: req.user.id,
      message: req.body.message,
    });

    await notificationService.createNotification({
      userId: ticket.userId,
      title: `Reply: ${ticket.subject}`,
      body: req.body.message,
      type: notificationService.NOTIFICATION_TYPES.SUPPORT_REPLY,
      referenceId: ticket.id,
      referenceType: "SUPPORT_TICKET",
    });

    const data = await repository.update(ticket.id, {
      status: "REPLIED",
    });

    res.status(201).json({ success: true, message: "Support reply sent.", data: { ...data, reply } });
  } catch (error) {
    next(error);
  }
}

async function resolveTicket(req, res, next) {
  try {
    const data = await repository.update(req.params.id, {
      status: "RESOLVED",
      resolvedAt: new Date(),
    });

    res.json({ success: true, message: "Support ticket resolved.", data });
  } catch (error) {
    next(error);
  }
}

module.exports = { createTicket, getMyTickets, getAllTickets, replyToTicket, resolveTicket };
