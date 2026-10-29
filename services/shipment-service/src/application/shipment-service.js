const repository = require('../infrastructure/shipment-repository');

async function handleOrderCreated(event) {
  if (!event || !event.oid) {
    throw new Error(
      'OrderCreated event must contain oid'
    );
  }

  const oid = Number(event.oid);

  if (!Number.isInteger(oid) || oid <= 0) {
    throw new Error(
      'Invalid oid in OrderCreated event'
    );
  }

  /*
   * Kiểm tra Shipment đã tồn tại chưa.
   *
   * Đây là bước chống duplicate event.
   */
  const existingShipment =
    await repository.findByOid(oid);

  if (existingShipment) {
    console.log(
      `Shipment for order ${oid} already exists. Skip duplicate event.`
    );

    return existingShipment;
  }

  /*
   * shipid được tạo dựa trên thời gian hiện tại.
   */
  const shipid = Date.now();

  const shipment =
    await repository.createShipment({
      shipid,
      oid,
      uid: Number(event.uid),
      status: 'PENDING'
    });

  console.log(
    `Shipment ${shipment.shipid} created for order ${oid}`
  );

  return shipment;
}

async function getShipment(shipid) {
  const shipment =
    await repository.findByShipid(shipid);

  if (!shipment) {
    const error = new Error(
      'Shipment not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return shipment;
}

async function updateShipmentStatus(
  shipid,
  status
) {
  const allowedStatuses = [
    'PENDING',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED'
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      'Invalid shipment status'
    );

    error.statusCode = 400;

    throw error;
  }

  const shipment =
    await repository.updateStatus(
      shipid,
      status
    );

  if (!shipment) {
    const error = new Error(
      'Shipment not found'
    );

    error.statusCode = 404;

    throw error;
  }

  return shipment;
}

module.exports = {
  handleOrderCreated,
  getShipment,
  updateShipmentStatus
};