function firstZodMessage(error, fallback = 'Invalid request payload.') {
  return error?.errors?.[0]?.message || error?.message || fallback;
}

function parseWithSchema(schema, req, res, next) {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: firstZodMessage(result.error),
    });
  }

  req.body = result.data;
  return next();
}

module.exports = {
  firstZodMessage,
  parseWithSchema,
};