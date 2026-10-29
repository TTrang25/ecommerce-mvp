const express = require('express');

const productService = require('./application/product-service');
const createProductRoutes = require('./interfaces/http/product-routes');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'product-service'
  });
});

app.use(
  '/api/products',
  createProductRoutes(productService)
);

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
});

module.exports = app;