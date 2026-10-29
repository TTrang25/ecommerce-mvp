const Shipment = require('./shipment-model');

async function findByShipid(shipid) {
  return Shipment.findOne({ shipid }).lean();
}

async function findByOid(oid) {
  return Shipment.findOne({ oid }).lean();
}

async function createShipment(data) {
  return Shipment.create(data);
}

async function updateStatus(shipid, status) {
  return Shipment.findOneAndUpdate(
    { shipid },
    {
      $set: {
        status,
        updatedAt: new Date()
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).lean();
}

module.exports = {
  findByShipid,
  findByOid,
  createShipment,
  updateStatus
};