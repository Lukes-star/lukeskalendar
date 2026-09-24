import { PGlite } from '@electric-sql/pglite';

export interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  birth_date: string | null;
  gender: string | null;
  currency: string;
  is_active: boolean;
  no_show: number;
  blocked: boolean;
  vehicles: any[];
  note: string | null;
  created_at: string;
}

export interface AppointmentRow {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  vehicle: any;
  service_id: string;
  service_name: string;
  duration: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  status: string;
  employee_id: string | null;
  employee_name: string | null;
  image_url: string | null;
  created_at: string;
}

export interface NoteRow {
  id: string;
  content: string;
  date: string;
  reminder_time: string;
  is_triggered: boolean;
  created_at: string;
}

export interface ServiceRow {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  currency: string;
  discontinued: boolean;
  created_at: string;
}

let dbInstance: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL,
  email text,
  address text,
  birth_date text,
  gender text,
  currency text NOT NULL DEFAULT 'RSD',
  is_active boolean NOT NULL DEFAULT true,
  no_show integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  vehicles text NOT NULL DEFAULT '[]',
  note text,
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS appointments (
  id text PRIMARY KEY,
  client_id text,
  client_name text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  vehicle text NOT NULL DEFAULT '{}',
  service_id text NOT NULL DEFAULT '',
  service_name text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 0,
  date text NOT NULL,
  start_time text,
  end_time text,
  note text,
  status text NOT NULL DEFAULT 'scheduled',
  employee_id text,
  employee_name text,
  image_url text,
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notes (
  id text PRIMARY KEY,
  content text NOT NULL,
  date text NOT NULL,
  reminder_time text NOT NULL,
  is_triggered boolean NOT NULL DEFAULT false,
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 60,
  price integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'RSD',
  discontinued boolean NOT NULL DEFAULT false,
  created_at text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(date);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON appointments(client_id);
CREATE INDEX IF NOT EXISTS notes_date_idx ON notes(date);
`;

const IMPORTED_APPOINTMENTS = [
  { id: 'imported-2026-09-23-srbo-taxi', clientName: 'Srbo Taxi', phone: '', model: 'Astra K', service: 'Ugradnja Led Sijalica', note: null, date: '2026-09-23' },
  { id: 'imported-2026-09-22-servolet', clientName: 'Servolet', phone: '0653179279', model: 'Servolet', service: 'Ispitivanje Fara', note: 'Far ispitati ima vode 08h', date: '2026-09-22' },
  { id: 'imported-2026-09-18-bmw-e90', clientName: 'Bmw E90', phone: '0612334474', model: 'Bmw E90', plate: '061', service: 'Ugradnja Led Sijalica', note: 'Ugradnja xenona 8h 0612334474', date: '2026-09-18' },
  { id: 'imported-2026-09-18-mitric', clientName: 'Mitric', phone: '064', model: 'Golf 7', service: 'Resavanje Dnevno Svetlo', note: 'Golf 7 pukla sijalica 12h', date: '2026-09-18' },
  { id: 'imported-2026-09-17-srbo-taxi', clientName: 'Srbo Taxi', phone: '', model: 'Astra K', service: 'Reparacija Fara Zamena Stakla', note: 'Dnevno svetlo', date: '2026-09-17' },
  { id: 'imported-2026-09-16-bmw-f21', clientName: 'Bmw F21', phone: '069695269', model: 'Bmw F21', service: 'Ugradnja Led Sijalica', note: 'Nenad ispitivanje fara sijalice', date: '2026-09-16' },
  { id: 'imported-2026-09-15-audi-a6-c8', clientName: 'Audi A6 C8', phone: 'viber', model: 'Audi A6 C8', service: 'Resavanje Dnevno Svetlo', note: 'Zeljko komplet 380e', date: '2026-09-15' },
  { id: 'imported-2026-09-14-mitric', clientName: 'Mitric', phone: '064', model: 'Golf 7', service: 'Resavanje Dnevno Svetlo', note: 'Golf 7 pukla sijalica', date: '2026-09-14' },
];

async function seedImportedAppointments(db: PGlite): Promise<void> {
  for (const appointment of IMPORTED_APPOINTMENTS) {
    await db.query(
      `INSERT INTO appointments
        (id, client_id, client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status, created_at)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        appointment.id,
        appointment.clientName,
        appointment.phone,
        JSON.stringify({ make: '', model: appointment.model, plate: appointment.plate || '' }),
        appointment.service.toLowerCase().replace(/ /g, '-'),
        appointment.service,
        60,
        appointment.date,
        appointment.note,
        'Marko Arsenovic',
        nowISO(),
      ],
    );
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}

function nowISO(): string {
  return new Date().toISOString();
}

function parseJsonField(val: any): any {
  if (val == null) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

export async function getDb(): Promise<PGlite> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = new PGlite('idb://servis-farova-v2');
    await db.exec(SCHEMA);
    await db.exec(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS note text`);
    await seedImportedAppointments(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

export async function queryAll<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const db = await getDb();
  const result = await db.query(sql, params);
  return (result.rows as any[]).map(parseRow);
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await queryAll<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params?: any[]): Promise<void> {
  const db = await getDb();
  await db.query(sql, params);
}

export async function insertReturning<T = any>(sql: string, params?: any[]): Promise<T> {
  const db = await getDb();
  const result = await db.query(sql, params);
  const rows = (result.rows as any[]).map(parseRow);
  if (!rows[0]) throw new Error('INSERT nije vratio red');
  return rows[0] as T;
}

function parseRow(row: any): any {
  if (!row) return row;
  const out: any = {};
  for (const key of Object.keys(row)) {
    const val = row[key];
    if (key === 'vehicles' || key === 'vehicle') {
      out[key] = parseJsonField(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function newId(): string {
  return uuid();
}

export function now(): string {
  return nowISO();
}
