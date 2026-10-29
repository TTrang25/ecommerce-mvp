const express = require('express');

function createOrderRoutes(orderService) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
    uid: Number(req.user.sub),
    items: req.body.items
});

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

  router.get('/', async (req, res, next) => {
  try {
    const uid = Number(req.user.sub);

    const orders = await orderService.getOrders(uid);

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

  router.get('/:oid', async (req, res, next) => {
    try {
      const oid = Number(req.params.oid);

      if (!Number.isInteger(oid) || oid <= 0) {
        return res.status(400).json({
          message: 'Invalid order id'
        });
      }

      const order = await orderService.getOrder(
  oid,
  Number(req.user.sub)
);

      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createOrderRoutes;