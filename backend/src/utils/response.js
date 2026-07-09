function success(res, { statusCode = 200, message = 'Success', data = null, meta = undefined } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

function failure(res, { statusCode = 500, message = 'Internal Server Error', errors = undefined } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

module.exports = {
  success,
  failure,
};
