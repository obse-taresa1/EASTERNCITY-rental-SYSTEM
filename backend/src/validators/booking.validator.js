function validateCreateBooking(req, res, next) {
  const required = [
    "listingId",
    "ownerId",
    "startDate",
    "endDate",
    "subtotal",
    "serviceFee",
    "totalAmount",
  ];

  const missing = required.filter(
    (field) =>
      req.body[field] === undefined ||
      req.body[field] === null ||
      req.body[field] === "",
  );

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  if (!req.body.agreementAccepted) {
    return res.status(400).json({
      success: false,
      message: "Rental agreement must be accepted.",
    });
  }

  next();
}

module.exports = { validateCreateBooking };
