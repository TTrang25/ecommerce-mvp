const express = require('express');

const shipmentService = require('./application/shipment-service');
const createShipmentRoutes = require('./interfaces/http/shipment-routes');

const app = express();

app.use(express.json());

/*
 * Health check
 */
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'shipment-service'
  });
});

/*
 * Shipment APIs
 */
app.use(
  '/api/shipments',
  createShipmentRoutes(shipmentService)
);

/*
 * Error handler
 */
app.use((error, req, res, next) => {
  console.error(error);

  const statusCode =
    error.statusCode || 500;

  res.status(statusCode).json({
    message:
      error.message || 'Internal server error'
  });
});

module.exports = app;