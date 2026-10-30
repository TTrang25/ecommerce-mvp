const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

let redisConnected = false;

async function connectRedis() {
  if (!redisConnected) {
    await redisClient.connect();
    redisConnected = true;
    console.log('Gateway Redis connected');
  }
}

async function rateLimit(req, res, next) {
  console.log('>>> RATE LIMIT MIDDLEWARE RUN <<<');  
  try {
    await connectRedis();

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown';

    const key = `rate_limit:${ip}`;

    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, 60);
    }

    console.log('Rate limit:', key, 'count =', count);

    if (count > 30) {
      return res.status(429).json({
        message: 'Too many requests'
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error.message);
    next();
  }
}

module.exports = rateLimit;