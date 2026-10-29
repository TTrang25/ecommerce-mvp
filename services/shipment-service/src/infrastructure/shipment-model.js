const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    shipid: {
      type: Number,
      required: true,
      unique: true
    },

    oid: {
      type: Number,
      required: true,
      unique: true
    },

    uid: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      required: true,
      default: 'PENDING',
      enum: [
        'PENDING',
        'SHIPPING',
        'DELIVERED',
        'CANCELLED'
      ]
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'shipments'
  }
  );

const Shipment = mongoose.model(
  'Shipment',
  shipmentSchema
);

module.exports = Shipment;
