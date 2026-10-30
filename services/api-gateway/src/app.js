const express = require('express');

console.log('>>> API GATEWAY APP.JS LOADED <<<');

const authenticateToken = require('./middleware/auth-middleware');
const authorizeRoles = require('./middleware/authorize-role');
const rateLimit = require('./middleware/rate-limit');
const requestLogger = require('./middleware/request-logger');
const productCache = require('./middleware/product-cache');

const app = express();

app.use(express.json());

// Redis Rate Limiting
app.use(rateLimit);
app.use(requestLogger);

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

const CUSTOMER_SERVICE_URL =
  process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002';

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

const SHIPMENT_SERVICE_URL =
  process.env.SHIPMENT_SERVICE_URL || 'http://localhost:3005';

/*
 * Generic proxy function
 */
async function proxyRequest(req, res, targetBaseUrl) {
  try {
    const targetUrl =
      `${targetBaseUrl}${req.originalUrl}`;

    console.log(
      'Gateway forwarding:',
      req.method,
      '->',
      targetUrl
    );

    const headers = {};

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    if (req.headers['content-type']) {
      headers['Content-Type'] =
        req.headers['content-type'];
    } else {
      headers['Content-Type'] =
        'application/json';
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body:
        ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : JSON.stringify(req.body)
    });

    const data = await response.text();

    console.log(
      'Service response status:',
      response.status
    );

    res.status(response.status);

    res.set(
      'Content-Type',
      response.headers.get('content-type') ||
        'application/json'
    );

    res.send(data);
  } catch (error) {
    console.error(
      'Gateway proxy error:',
      error.message
    );

    res.status(502).json({
      message: 'Target service unavailable'
    });
  }
}

/*
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway'
  });
});

/*
 * JWT Authentication Test
 */
app.get(
  '/api/auth-test',
  authenticateToken,
  (req, res) => {
    res.json({
      message: 'JWT authentication successful',
      user: req.user
    });
  }
);

/*
 * Authorization Test - ADMIN only
 */
app.get(
  '/api/admin-test',
  authenticateToken,
  authorizeRoles('ADMIN'),
  (req, res) => {
    res.json({
      message: 'Authorization successful',
      user: req.user
    });
  }
);

/*
 * Auth Service
 */
app.use('/api/auth', async (req, res) => {
  await proxyRequest(
    req,
    res,
    AUTH_SERVICE_URL
  );
});

/*
 * Customer Service
 * Requires JWT
 */
app.use(
  '/api/customers',
  authenticateToken,
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      CUSTOMER_SERVICE_URL
    );
  }
);

/*
 * Product Service
 *
 * GET can be public.
 * POST/PUT/DELETE require ADMIN.
 */
app.get(
  '/api/products',
  productCache,
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      PRODUCT_SERVICE_URL
    );
  }
);

app.get(
  '/api/products/:pid',
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      PRODUCT_SERVICE_URL
    );
  }
);

app.post(
  '/api/products',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      PRODUCT_SERVICE_URL
    );
  }
);

app.put(
  '/api/products/:pid',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      PRODUCT_SERVICE_URL
    );
  }
);

app.delete(
  '/api/products/:pid',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      PRODUCT_SERVICE_URL
    );
  }
);

/*
 * Order Service
 * Requires JWT
 */
app.use(
  '/api/orders',
  authenticateToken,
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      ORDER_SERVICE_URL
    );
  }
);

/*
 * Shipment Service
 * Requires JWT
 */
app.use(
  '/api/shipments',
  authenticateToken,
  async (req, res) => {
    await proxyRequest(
      req,
      res,
      SHIPMENT_SERVICE_URL
    );
  }
);

/*
 * Error Handler
 */
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: 'API Gateway internal server error'
  });
});

module.exports = app;
