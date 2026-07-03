function validateCreateListing(req, res, next) {
  const required = [
    "title",
    "description",
    "categoryId",
    "city",
    "location",
    "pricePerDay",
  ];

  const missing = required.filter((field) => !req.body[field]);
  const status = String(req.body.status || "PENDING").toUpperCase();
  const paymentFiles = req.files?.paymentProof || [];
  const hasPaymentProof =
    paymentFiles.length > 0 || Boolean(req.body.paymentProofUrl);
  const hasPaymentMethod = Boolean(req.body.paymentMethod);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  if (status !== "DRAFT") {
    if (!hasPaymentMethod) {
      return res.status(400).json({
        success: false,
        message: "paymentMethod is required.",
      });
    }

    if (!hasPaymentProof) {
      return res.status(400).json({
        success: false,
        message: "paymentProof is required.",
      });
    }
  }

  if (Number(req.body.pricePerDay) <= 0) {
    return res.status(400).json({
      success: false,
      message: "pricePerDay must be greater than 0.",
    });
  }

  next();
}

function validateUpdateListing(req, res, next) {
  if (req.body.pricePerDay !== undefined && Number(req.body.pricePerDay) <= 0) {
    return res.status(400).json({
      success: false,
      message: "pricePerDay must be greater than 0.",
    });
  }

  next();
}

module.exports = {
  validateCreateListing,
  validateUpdateListing,
};
