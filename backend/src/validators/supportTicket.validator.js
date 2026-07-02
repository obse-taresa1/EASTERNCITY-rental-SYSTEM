function validateCreateTicket(req, res, next) {
  if (!req.body.subject || !req.body.message) {
    return res.status(400).json({
      success: false,
      message: "Subject and message are required.",
    });
  }

  next();
}

module.exports = { validateCreateTicket };
