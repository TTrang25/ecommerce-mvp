function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    console.log(
      `[Gateway] ${req.method} ${req.originalUrl} -> ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

module.exports = requestLogger;