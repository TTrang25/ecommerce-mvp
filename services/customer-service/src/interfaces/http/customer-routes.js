const express = require('express');

module.exports = ({ getCustomer, updateCustomer, authenticate }) => {
  const router = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

  router.get('/:uid', authenticate, wrap(async (req, res) => {
    const customer = await getCustomer({ requester: req.user, rawUid: req.params.uid });
    res.status(200).json(customer);
  }));

  router.put('/:uid', authenticate, wrap(async (req, res) => {
    const result = await updateCustomer({
      requester: req.user,
      rawUid: req.params.uid,
      input: req.body || {},
    });
    res.status(200).json(result);
  }));

  return router;
};