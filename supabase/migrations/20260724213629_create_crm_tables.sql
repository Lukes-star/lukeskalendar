/*
# Create CRM Tables: clients, appointments, notes

## Summary
Single-tenant CRM schema for an auto headlight service shop. No sign-in required.
All tables use TO anon, authenticated policies so the frontend anon key can read/write freely.

## Tables Created

### clients
- id (uuid, PK)
- first_name, last_name (text)
- phone (text, optional)
- email (text, optional)
- address (text, optional)
- birth_date (date, optional)
- gender (text: male|female, optional)
- currency (text: RSD|EUR, default RSD)
- is_active (boolean, default true)
- no_show (int, default 0)
- blocked (boolean, default false)
- vehicles (jsonb array: [{make,model,plate,year}])
- created_at (timestamptz)

### appointments
- id (uuid, PK)
- client_id (uuid, FK -> clients.id)
- client_name, client_phone (text)
- vehicle (jsonb: {make,model,plate,year})
- service_id, service_name (text)
- duration (int, minutes)
- date (date)
- start_time (text HH:MM, optional)
- end_time (text HH:MM, optional)
- note (text, optional)
- status (text: scheduled|in_progress|completed|cancelled)
- employee_id, employee_name (text, optional)
- image_url (text, optional)
- created_at (timestamptz)

### notes (calendar reminders)
- id (uuid, PK)
- content (text)
- date (date)
- reminder_time (text HH:MM)
- is_triggered (boolean, default false)
- created_at (timestamptz)

## Security
RLS enabled on all three tables. Anon + authenticated CRUD allowed (single-tenant, no auth).
*/

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text,
  address text,
  birth_date date,
  gender text CHECK (gender IN ('male','female')),
  currency text NOT NULL DEFAULT 'RSD' CHECK (currency IN ('RSD','EUR')),
  is_active boolean NOT NULL DEFAULT true,
  no_show integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  vehicles jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon, authenticated USING (true);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  vehicle jsonb NOT NULL DEFAULT '{}'::jsonb,
  service_id text NOT NULL DEFAULT '',
  service_name text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 0,
  date date NOT NULL,
  start_time text,
  end_time text,
  note text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  employee_id text,
  employee_name text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_appointments" ON appointments;
CREATE POLICY "anon_select_appointments" ON appointments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_appointments" ON appointments;
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_appointments" ON appointments;
CREATE POLICY "anon_update_appointments" ON appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE TO anon, authenticated USING (true);

-- Notes (calendar reminders with alarm)
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  date date NOT NULL,
  reminder_time text NOT NULL,
  is_triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(date);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON appointments(client_id);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS notes_date_idx ON notes(date);
