const express = require('express');
const config = require('./config');
const { pool } = require('./infrastructure/db');
const userRepository = require('./infrastructure/user-repository');
const passwordHasher = require('./infrastructure/password-hasher');
const tokenService = require('./infrastructure/token-service');
const makeRegisterUser = require('./application/register-user');
const makeLoginUser = require('./application/login-user');
const authRoutes = require('./interfaces/http/auth-routes');
const errorHandler = require('./interfaces/http/error-handler');

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'UP', service: 'auth-service' });
    } catch (err) {
      res.status(503).json({ status: 'DOWN', service: 'auth-service' });
    }
  });

  const registerUser = makeRegisterUser({ userRepository, passwordHasher });
  const loginUser = makeLoginUser({
    userRepository,
    passwordHasher,
    tokenService,
    expiresInSec: config.jwt.expiresInSec,
  });

  app.use('/api/auth', authRoutes({ registerUser, loginUser }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };