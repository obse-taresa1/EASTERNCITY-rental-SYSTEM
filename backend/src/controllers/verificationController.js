const verificationService = require('../services/verificationService');

const submit = async (req, res, next) => {
  try {
    const result = await verificationService.submitVerification(
      req.user.id,
      req.body,
      req.files,
    );
    res.status(202).json({
      success: true,
      message: 'Verification submitted successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await verificationService.listVerificationRequests();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const review = async (req, res, next) => {
  try {
    const result = await verificationService.reviewVerification(req.params.userId, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Verification reviewed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submit,
  list,
  review,
};
