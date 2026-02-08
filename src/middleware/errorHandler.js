module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  // In production, don’t leak stack
  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    message: err.message || "Server error",
    ...(isProd ? {} : { stack: err.stack }),
  });
};
