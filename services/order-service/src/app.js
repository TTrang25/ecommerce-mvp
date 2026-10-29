const express = require('express');

const { testConnection } = require('./infrastructure/db');
const orderService = require('./application/order-service');
const createOrderRoutes = require('./interfaces/http/order-routes');
const authenticateToken = require('./interfaces/http/middlewares/auth-middleware');

const app = express();

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const database = await testConnection();

    res.json({
      status: 'ok',
      service: 'order-service',
      database: database.ok === 1 ? 'connected' : 'unknown'
    });
  } catch (error) {
    console.error('Health check error:', error);

    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use(
  '/api/orders',
  authenticateToken,
  createOrderRoutes(orderService)
);

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
});

module.exports = app;