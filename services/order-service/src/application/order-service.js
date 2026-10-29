const { pool } = require('../infrastructure/db');
const repository = require('../infrastructure/order-repository');

async function createOrder(data) {
  if (!data.uid) {
    const error = new Error('uid is required');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error('items are required');
    error.statusCode = 400;
    throw error;
  }

  let subtotal = 0;

  for (const item of data.items) {
    if (!Number.isInteger(item.pid) || item.pid <= 0) {
      const error = new Error('Invalid pid');
      error.statusCode = 400;
      throw error;
    }

    if (!item.pname || typeof item.pname !== 'string') {
      const error = new Error('pname is required');
      error.statusCode = 400;
      throw error;
    }

    if (typeof item.price !== 'number' || item.price < 0) {
      const error = new Error('Invalid price');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      const error = new Error('Invalid quantity');
      error.statusCode = 400;
      throw error;
    }

    subtotal += item.price * item.quantity;
  }

  const discountPercent = 0;
  const discountAmount = 0;
  const totalAmount = subtotal;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await repository.createOrder(client, {
      uid: data.uid,
      subtotal,
      discountPercent,
      discountAmount,
      totalAmount,
      status: 'CREATED'
    });

    const details = [];

    for (const item of data.items) {
      const detail = await repository.createOrderDetail(client, {
        oid: order.oid,
        pid: item.pid,
        pname: item.pname,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity
      });

      details.push(detail);
    }

    await client.query('COMMIT');

    order.details = details;

    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getOrders(uid) {
  return repository.findOrdersByUid(uid);
}

async function getOrder(oid, uid) {
  const order = await repository.findOrderById(oid);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (Number(order.uid) !== Number(uid)) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  return order;
}
module.exports = {
  createOrder,
  getOrders,
  getOrder
};