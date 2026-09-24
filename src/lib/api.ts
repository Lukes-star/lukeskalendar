import { queryAll, execute, insertReturning, newId, now } from '@/lib/db';
import type { ClientRow, AppointmentRow, NoteRow, ServiceRow } from '@/lib/db';
import { remoteConfigured, selectRemote, insertRemote, updateRemote, deleteRemote } from '@/lib/remote';

// ============ Clients ============

export async function fetchClients(): Promise<ClientRow[]> {
  if (remoteConfigured) return selectRemote<ClientRow>('clients', 'select=*&order=created_at.desc');
  return queryAll<ClientRow>(
    `SELECT * FROM clients ORDER BY created_at DESC`
  );
}

export async function createClient(data: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  currency?: string;
  is_active?: boolean;
  vehicles?: any[];
  note?: string | null;
}): Promise<ClientRow> {
  const id = newId();
  const ts = now();
  if (remoteConfigured) return insertRemote<ClientRow>('clients', {
    id, first_name: data.first_name, last_name: data.last_name, phone: data.phone || '',
    email: data.email || null, address: data.address || null, birth_date: data.birth_date || null,
    gender: data.gender || null, currency: data.currency || 'RSD', is_active: data.is_active ?? true,
    vehicles: data.vehicles || [], note: data.note || null, created_at: ts,
  });
  return insertReturning<ClientRow>(
    `INSERT INTO clients (id, first_name, last_name, phone, email, address, birth_date, gender, currency, is_active, vehicles, note, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      data.first_name, data.last_name, data.phone,
      data.email || null, data.address || null, data.birth_date || null,
      data.gender || null, data.currency || 'RSD',
      data.is_active ?? true,
      JSON.stringify(data.vehicles || []),
      data.note || null,
      ts,
    ]
  );
}

export async function updateClient(id: string, data: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  currency?: string;
  is_active?: boolean;
  vehicles?: any[];
  note?: string | null;
}): Promise<ClientRow> {
  if (remoteConfigured) return updateRemote<ClientRow>('clients', id, {
    first_name: data.first_name, last_name: data.last_name, phone: data.phone || '',
    email: data.email || null, address: data.address || null, birth_date: data.birth_date || null,
    gender: data.gender || null, currency: data.currency || 'RSD', is_active: data.is_active ?? true,
    vehicles: data.vehicles || [], note: data.note || null,
  });
  return insertReturning<ClientRow>(
    `UPDATE clients SET
      first_name = $2, last_name = $3, phone = $4,
      email = $5, address = $6, birth_date = $7, gender = $8,
      currency = $9, is_active = $10, vehicles = $11, note = $12
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.first_name, data.last_name, data.phone,
      data.email || null, data.address || null, data.birth_date || null,
      data.gender || null, data.currency || 'RSD',
      data.is_active ?? true,
      JSON.stringify(data.vehicles || []),
      data.note || null,
    ]
  );
}

export async function deleteClient(id: string): Promise<void> {
  if (remoteConfigured) return deleteRemote('clients', id);
  await execute(`DELETE FROM clients WHERE id = $1`, [id]);
}

export async function updateClientActive(id: string, isActive: boolean): Promise<void> {
  if (remoteConfigured) { await updateRemote<ClientRow>('clients', id, { is_active: isActive }); return; }
  await execute(`UPDATE clients SET is_active = $2 WHERE id = $1`, [id, isActive]);
}

// ============ Appointments ============

export async function fetchAppointments(): Promise<AppointmentRow[]> {
  if (remoteConfigured) return selectRemote<AppointmentRow>('appointments', 'select=*&order=date.asc,created_at.asc');
  return queryAll<AppointmentRow>(
    `SELECT * FROM appointments ORDER BY date ASC`
  );
}

export async function createAppointment(data: {
  client_id: string;
  client_name: string;
  client_phone: string;
  vehicle: any;
  service_id: string;
  service_name: string;
  duration: number;
  date: string;
  note?: string | null;
  employee_name?: string | null;
  image_url?: string | null;
  status?: string;
}): Promise<AppointmentRow> {
  const id = newId();
  const ts = now();
  if (remoteConfigured) return insertRemote<AppointmentRow>('appointments', {
    id, client_id: data.client_id || null, client_name: data.client_name, client_phone: data.client_phone || '',
    vehicle: data.vehicle || {}, service_id: data.service_id, service_name: data.service_name, duration: data.duration,
    date: data.date, note: data.note || null, employee_name: data.employee_name || null,
    image_url: data.image_url || null, status: data.status || 'scheduled', created_at: ts,
  });
  return insertReturning<AppointmentRow>(
    `INSERT INTO appointments
      (id, client_id, client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, image_url, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      id,
      data.client_id, data.client_name, data.client_phone,
      JSON.stringify(data.vehicle),
      data.service_id, data.service_name, data.duration,
      data.date, data.note || null, data.employee_name || null,
      data.image_url || null, data.status || 'scheduled',
      ts,
    ]
  );
}

export async function updateAppointment(id: string, data: {
  client_id: string;
  client_name: string;
  client_phone: string;
  vehicle: any;
  service_id: string;
  service_name: string;
  duration: number;
  date: string;
  note?: string | null;
  employee_name?: string | null;
  image_url?: string | null;
}): Promise<AppointmentRow> {
  if (remoteConfigured) return updateRemote<AppointmentRow>('appointments', id, {
    client_id: data.client_id || null, client_name: data.client_name, client_phone: data.client_phone || '',
    vehicle: data.vehicle || {}, service_id: data.service_id, service_name: data.service_name, duration: data.duration,
    date: data.date, note: data.note || null, employee_name: data.employee_name || null,
    image_url: data.image_url || null,
  });
  return insertReturning<AppointmentRow>(
    `UPDATE appointments SET
      client_id = $2, client_name = $3, client_phone = $4, vehicle = $5,
      service_id = $6, service_name = $7, duration = $8,
      date = $9, note = $10, employee_name = $11, image_url = $12
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.client_id, data.client_name, data.client_phone,
      JSON.stringify(data.vehicle),
      data.service_id, data.service_name, data.duration,
      data.date, data.note || null, data.employee_name || null,
      data.image_url || null,
    ]
  );
}

export async function updateAppointmentStatus(id: string, status: string): Promise<void> {
  if (remoteConfigured) { await updateRemote<AppointmentRow>('appointments', id, { status }); return; }
  await execute(`UPDATE appointments SET status = $2 WHERE id = $1`, [id, status]);
}

export async function deleteAppointment(id: string): Promise<void> {
  if (remoteConfigured) return deleteRemote('appointments', id);
  await execute(`DELETE FROM appointments WHERE id = $1`, [id]);
}

// ============ Notes ============

export async function fetchNotes(): Promise<NoteRow[]> {
  if (remoteConfigured) return selectRemote<NoteRow>('notes', 'select=*&order=date.asc,reminder_time.asc');
  return queryAll<NoteRow>(
    `SELECT * FROM notes ORDER BY date ASC, reminder_time ASC`
  );
}

export async function createNote(data: {
  content: string;
  date: string;
  reminder_time: string;
}): Promise<NoteRow> {
  const id = newId();
  const ts = now();
  if (remoteConfigured) return insertRemote<NoteRow>('notes', {
    id, content: data.content, date: data.date, reminder_time: data.reminder_time,
    is_triggered: false, created_at: ts,
  });
  return insertReturning<NoteRow>(
    `INSERT INTO notes (id, content, date, reminder_time, is_triggered, created_at)
     VALUES ($1, $2, $3, $4, false, $5)
     RETURNING *`,
    [id, data.content, data.date, data.reminder_time, ts]
  );
}

export async function updateNoteTriggered(id: string, triggered: boolean): Promise<void> {
  if (remoteConfigured) { await updateRemote<NoteRow>('notes', id, { is_triggered: triggered }); return; }
  await execute(`UPDATE notes SET is_triggered = $2 WHERE id = $1`, [id, triggered]);
}

// ============ Services ============

export async function fetchServices(): Promise<ServiceRow[]> {
  if (remoteConfigured) return selectRemote<ServiceRow>('services', 'select=*&order=name.asc');
  return queryAll<ServiceRow>(`SELECT * FROM services ORDER BY name`);
}

export async function createService(data: {
  name: string;
  category: string;
  duration: number;
  price: number;
  currency: string;
}): Promise<ServiceRow> {
  const id = newId();
  const ts = now();
  if (remoteConfigured) return insertRemote<ServiceRow>('services', {
    id, name: data.name, category: data.category, duration: data.duration, price: data.price,
    currency: data.currency, discontinued: false, created_at: ts,
  });
  return insertReturning<ServiceRow>(
    `INSERT INTO services (id, name, category, duration, price, currency, discontinued, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, false, $7)
     RETURNING *`,
    [id, data.name, data.category, data.duration, data.price, data.currency, ts]
  );
}

export async function updateService(id: string, data: {
  name: string;
  category: string;
  duration: number;
  price: number;
  currency: string;
}): Promise<ServiceRow> {
  if (remoteConfigured) return updateRemote<ServiceRow>('services', id, {
    name: data.name, category: data.category, duration: data.duration, price: data.price, currency: data.currency,
  });
  return insertReturning<ServiceRow>(
    `UPDATE services SET name = $2, category = $3, duration = $4, price = $5, currency = $6
     WHERE id = $1
     RETURNING *`,
    [id, data.name, data.category, data.duration, data.price, data.currency]
  );
}

export async function deleteService(id: string): Promise<void> {
  if (remoteConfigured) return deleteRemote('services', id);
  await execute(`DELETE FROM services WHERE id = $1`, [id]);
}
