const repository = require("../repositories/supportTicket.repository");

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

module.exports = { createTicket, getMyTickets, getAllTickets, resolveTicket };
