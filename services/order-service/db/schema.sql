CREATE TABLE IF NOT EXISTS orders (
  oid BIGSERIAL PRIMARY KEY,
  uid INT NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0
    CHECK (discount_amount >= 0),
  total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_details (
  odid BIGSERIAL PRIMARY KEY,
  oid BIGINT NOT NULL REFERENCES orders(oid) ON DELETE CASCADE,
  pid INT NOT NULL,
  pname VARCHAR(255) NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(15, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_uid
  ON orders(uid);

CREATE INDEX IF NOT EXISTS idx_order_details_oid
  ON order_details(oid);

CREATE TABLE IF NOT EXISTS outbox_events (
  id BIGSERIAL PRIMARY KEY,
  topic VARCHAR(100) NOT NULL,
  event_key VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_outbox_pending
  ON outbox_events(id)
  WHERE published_at IS NULL;