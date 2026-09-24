const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const remoteConfigured = Boolean(supabaseUrl && supabaseAnonKey);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase nije konfigurisan');
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase greška (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function selectRemote<T>(table: string, query = 'select=*'): Promise<T[]> {
  return request<T[]>(`${table}?${query}`);
}

export async function insertRemote<T>(table: string, data: Record<string, unknown>): Promise<T> {
  const rows = await request<T[]>(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
  if (!rows[0]) throw new Error('Supabase nije vratio sačuvani red');
  return rows[0];
}

export async function updateRemote<T>(table: string, id: string, data: Record<string, unknown>): Promise<T> {
  const rows = await request<T[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
  if (!rows[0]) throw new Error('Supabase nije pronašao podatak za izmenu');
  return rows[0];
}

export function deleteRemote(table: string, id: string): Promise<void> {
  return request<void>(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}
