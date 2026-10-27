const express = require('express');
const { pool } = require('./infrastructure/db');
const customerRepository = require('./infrastructure/customer-repository');
const tokenService = require('./infrastructure/token-service');
const makeGetCustomer = require('./application/get-customer');
const makeUpdateCustomer = require('./application/update-customer');
const makeAuthenticate = require('./interfaces/http/auth-middleware');
const customerRoutes = require('./interfaces/http/customer-routes');
const errorHandler = require('./interfaces/http/error-handler');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'UP', service: 'customer-service' });
    } catch (err) {
      res.status(503).json({ status: 'DOWN', service: 'customer-service' });
    }
  });

  const getCustomer = makeGetCustomer({ customerRepository });
  const updateCustomer = makeUpdateCustomer({ customerRepository });
  const authenticate = makeAuthenticate(tokenService);

  app.use('/api/customers', customerRoutes({ getCustomer, updateCustomer, authenticate }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };