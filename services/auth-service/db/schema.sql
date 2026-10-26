CREATE TABLE IF NOT EXISTS roles (
  roleid   SERIAL PRIMARY KEY,
  rolename VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (rolename) VALUES ('CUSTOMER'), ('ADMIN'), ('SHIPMENT_STAFF')
ON CONFLICT (rolename) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  uid        SERIAL PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  roleid     INT NOT NULL REFERENCES roles(roleid),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id           BIGSERIAL PRIMARY KEY,
  topic        VARCHAR(100) NOT NULL,
  event_key    VARCHAR(100) NOT NULL,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending
  ON outbox_events (id) WHERE published_at IS NULL;