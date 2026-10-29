const { pool } = require('./db');

async function createOrder(client, orderData) {
  const result = await client.query(
    `
    INSERT INTO orders (
      uid,
      subtotal,
      discount_percent,
      discount_amount,
      total_amount,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      orderData.uid,
      orderData.subtotal,
      orderData.discountPercent,
      orderData.discountAmount,
      orderData.totalAmount,
      orderData.status
    ]
  );

  return result.rows[0];
}

async function createOrderDetail(client, detailData) {
  const result = await client.query(
    `
    INSERT INTO order_details (
      oid,
      pid,
      pname,
      price,
      quantity,
      line_total
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      detailData.oid,
      detailData.pid,
      detailData.pname,
      detailData.price,
      detailData.quantity,
      detailData.lineTotal
    ]
  );

  return result.rows[0];
}

async function findOrdersByUid(uid) {
  const result = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE uid = $1
    ORDER BY created_at DESC
    `,
    [uid]
  );

  return result.rows;
}

async function findOrderById(oid) {
  const orderResult = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE oid = $1
    `,
    [oid]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  const detailResult = await pool.query(
    `
    SELECT *
    FROM order_details
    WHERE oid = $1
    ORDER BY odid
    `,
    [oid]
  );

  order.details = detailResult.rows;

  return order;
}

module.exports = {
  createOrder,
  createOrderDetail,
  findOrdersByUid,
  findOrderById
};