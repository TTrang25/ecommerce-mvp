const express = require('express');

function createShipmentRoutes(shipmentService) {
  const router = express.Router();

  /*
   * GET /api/shipments/:shipid
   *
   * Xem thông tin Shipment
   */
  router.get('/:shipid', async (req, res, next) => {
    try {
      const shipid = Number(req.params.shipid);

      if (!Number.isInteger(shipid) || shipid <= 0) {
        return res.status(400).json({
          message: 'Invalid shipment id'
        });
      }

      const shipment =
        await shipmentService.getShipment(shipid);

      res.json(shipment);
    } catch (error) {
      next(error);
    }
  });

  /*
   * PATCH /api/shipments/:shipid/status
   *
   * Body:
   * {
   *   "status": "SHIPPING"
   * }
   */
  router.patch(
    '/:shipid/status',
    async (req, res, next) => {
      try {
        const shipid =
          Number(req.params.shipid);

        if (
          !Number.isInteger(shipid) ||
          shipid <= 0
        ) {
          return res.status(400).json({
            message: 'Invalid shipment id'
          });
        }

        const { status } = req.body;

        const shipment =
          await shipmentService.updateShipmentStatus(
            shipid,
            status
          );

        res.json(shipment);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

module.exports = createShipmentRoutes;