const express = require('express');

module.exports = ({ registerUser, loginUser }) => {
  const router = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

  router.post('/register', wrap(async (req, res) => {
    const result = await registerUser(req.body || {});
    res.status(201).json(result);
  }));

  router.post('/login', wrap(async (req, res) => {
    const result = await loginUser(req.body || {});
    res.status(200).json(result);
  }));

  return router;
};