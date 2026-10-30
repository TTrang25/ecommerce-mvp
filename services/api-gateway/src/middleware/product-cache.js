const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (error) => {
  console.error('Redis Cache error:', error.message);
});

let redisConnected = false;

async function connectRedis() {
  if (!redisConnected) {
    await redisClient.connect();
    redisConnected = true;
    console.log('Gateway Redis Cache connected');
  }
}

async function productCache(req, res, next) {
  // Chỉ cache GET /api/products
  if (req.method !== 'GET') {
    return next();
  }

  try {
    await connectRedis();

    const key = 'cache:products';

    // Kiểm tra cache
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      console.log('Product Cache: HIT');

      res.set('X-Cache', 'HIT');
      res.set('Content-Type', 'application/json');

      return res.status(200).send(cachedData);
    }

    console.log('Product Cache: MISS');

    // Đánh dấu MISS
    res.set('X-Cache', 'MISS');

    // Lưu lại hàm send ban đầu
    const originalSend = res.send.bind(res);

    res.send = async (body) => {
      try {
        // Chỉ cache response thành công
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await redisClient.setEx(
            key,
            30,
            typeof body === 'string'
              ? body
              : JSON.stringify(body)
          );

          console.log('Product Cache: SAVED (30 seconds)');
        }
      } catch (error) {
        console.error(
          'Product Cache save error:',
          error.message
        );
      }

      return originalSend(body);
    };

    next();
  } catch (error) {
    console.error(
      'Product Cache error:',
      error.message
    );

    // Redis lỗi thì vẫn cho request đi tiếp
    next();
  }
}

module.exports = productCache;