CREATE TABLE IF NOT EXISTS memberships (
  mid   SERIAL PRIMARY KEY,
  mname VARCHAR(50) NOT NULL UNIQUE,
  score INT NOT NULL CHECK (score >= 0)
);

INSERT INTO memberships (mname, score) VALUES
  ('BRONZE', 0),
  ('SILVER', 100),
  ('GOLD', 500),
  ('PLATINUM', 1000)
ON CONFLICT (mname) DO NOTHING;

-- uid KHÔNG tự tăng: là cùng giá trị với User.uid bên Auth (không có FK xuyên database)
CREATE TABLE IF NOT EXISTS customers (
  uid        INT PRIMARY KEY,
  fullname   VARCHAR(100) NOT NULL,
  mid        INT NOT NULL REFERENCES memberships(mid),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ghi lại các event đã xử lý, để nhận trùng event không tạo trùng Customer
CREATE TABLE IF NOT EXISTS processed_events (
  event_id     UUID PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);