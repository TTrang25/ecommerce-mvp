const { pool } = require('../infrastructure/db');
const repository = require('../infrastructure/order-repository');
const customerClient = require('../infrastructure/customer-client');
const productGrpcClient = require('../grpc/product-grpc-client');

async function createOrder(data) {
  if (!data.uid) {
    const error = new Error('uid is required');
    error.statusCode = 400;
    throw error;
  }

  if (!data.token) {
    const error = new Error('Authorization token is required');
    error.statusCode = 401;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error('items are required');
    error.statusCode = 400;
    throw error;
  }

  const customer = await customerClient.getCustomer(
    data.uid,
    data.token
  );

  if (
    !customer.membership ||
    typeof customer.membership.score !== 'number'
  ) {
    const error = new Error(
      'Customer membership information is unavailable'
    );
    error.statusCode = 502;
    throw error;
  }

  const membershipScore = customer.membership.score;

  console.log(
    'Customer membership score:',
    membershipScore
  );

  const orderItems = [];
  let subtotal = 0;

  for (const item of data.items) {
    if (
      !Number.isInteger(item.pid) ||
      item.pid <= 0
    ) {
      const error = new Error('Invalid pid');
      error.statusCode = 400;
      throw error;
    }

    if (
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      const error = new Error('Invalid qty');
      error.statusCode = 400;
      throw error;
    }

    let product;

    try {
      product = await productGrpcClient.getProduct(
        item.pid
      );
    } catch (error) {
      console.error(
        'GetProduct gRPC error:',
        error
      );

      if (error.code === 5) {
        error.statusCode = 404;
        error.message = 'Product not found';
      } else {
        error.statusCode = 502;
        error.message =
          'Product Service is unavailable';
      }

      throw error;
    }

    if (product.quantity < item.qty) {
      const error = new Error(
        `Insufficient stock for product ${item.pid}`
      );
      error.statusCode = 409;
      throw error;
    }

    const price = Number(product.price);
    const lineTotal = price * item.qty;

    subtotal += lineTotal;

    orderItems.push({
      pid: product.pid,
      pname: product.pname,
      price,
      quantity: item.qty,
      lineTotal
    });
  }

  /*
   * Discount policy will be added after
   * the exact score -> discount rule is confirmed.
   */
  const discountPercent = 0;
  const discountAmount = 0;
  const totalAmount = subtotal;

  /*
   * Update inventory through Product Service.
   */
  for (const item of orderItems) {
    try {
      await productGrpcClient.updateInventory(
        item.pid,
        item.quantity
      );
    } catch (error) {
      console.error(
        'UpdateInventory gRPC error:',
        error
      );

      if (error.code === 5) {
        error.statusCode = 404;
        error.message = 'Product not found';
      } else if (error.code === 9) {
        error.statusCode = 409;
        error.message = 'Insufficient stock';
      } else {
        error.statusCode = 502;
        error.message =
          'Product Service is unavailable';
      }

      throw error;
    }
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await repository.createOrder(
      client,
      {
        uid: data.uid,
        subtotal,
        discountPercent,
        discountAmount,
        totalAmount,
        status: 'CREATED'
      }
    );

    const details = [];

    for (const item of orderItems) {
      const detail =
        await repository.createOrderDetail(
          client,
          {
            oid: order.oid,
            pid: item.pid,
            pname: item.pname,
            price: item.price,
            quantity: item.quantity,
            lineTotal: item.lineTotal
          }
        );

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