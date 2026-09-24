/*
# Create services table

## Summary
Single-tenant table for storing service catalog (headlight repair services).
No auth required. Anon + authenticated CRUD.

## Table Created
### services
- id (uuid, PK)
- name (text, not null)
- category (text, optional)
- duration (int, minutes, default 60)
- price (numeric, default 0)
- currency (text: RSD|EUR, default RSD)
- discontinued (boolean, default false)
- created_at (timestamptz)

## Security
RLS enabled. Anon + authenticated CRUD (single-tenant).
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  duration integer NOT NULL DEFAULT 60,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'RSD' CHECK (currency IN ('RSD','EUR')),
  discontinued boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

-- Seed default services
INSERT INTO services (name, category, duration, price, currency) VALUES
  ('Reparacija Fara Zamena Stakla', 'Reparacija', 240, 0, 'RSD'),
  ('Poliranje Farova', 'Poliranje', 150, 0, 'RSD'),
  ('Masinsko Poliranje Farova', 'Poliranje', 300, 0, 'RSD'),
  ('Ugradnja Led Sijalica', 'Ugradnja', 210, 0, 'RSD'),
  ('Zamena Modula', 'Zamena', 180, 0, 'RSD'),
  ('Zamena DRL Modula', 'Zamena', 270, 0, 'RSD'),
  ('Ispitivanje Fara', 'Dijagnostika', 120, 0, 'RSD'),
  ('Resavanje Dnevno Svetlo', 'Reparacija', 270, 0, 'RSD')
ON CONFLICT DO NOTHING;
