import { useState, useMemo } from 'react';
import { Search, Users, Plus, Phone, Ban, AlertTriangle, ChevronRight } from 'lucide-react';
import { Client } from '@/types/calendar';
import { STATUS_CONFIG } from '@/lib/calendar';

interface KlijentiListProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  onAddClient: () => void;
}

type Filter = 'all' | 'active' | 'inactive';

export function KlijentiList({ clients, onClientClick, onAddClient }: KlijentiListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    let result = clients;
    if (filter !== 'all') {
      result = result.filter((c) => filter === 'active' ? c.isActive : !c.isActive);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email?.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [clients, search, filter]);

  const activeCount = clients.filter((c) => c.isActive).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <div className="flex flex-col h-full px-4 md:px-6 py-4 md:py-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Klijenti</h1>
            </div>
          </div>
        </div>
        <div className="text-[12px] text-text-tertiary">{clients.length} ukupno · {activeCount} aktivno · {inactiveCount} neaktivno</div>
      </div>

      <div className="flex-1 min-h-0 bg-bg-card border border-primary/20 rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži klijente..."
            className="glass border border-border rounded-xl w-full py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
          />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-between md:justify-end">
          {(['all', 'active', 'inactive'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`press px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-hover'
              }`}
            >
              {f === 'all' ? 'Svi' : f === 'active' ? 'Aktivni' : 'Neaktivni'}
            </button>
          ))}
            <button onClick={onAddClient} className="press flex items-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all">
              <Plus size={16} /> Dodajte klijenta
            </button>
          </div>
        </div>

      {/* Table — desktop */}
      <div className="hidden md:block flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-bg-card z-10">
            <tr className="border-b border-border-subtle">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-6 py-3">Ime</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Telefon</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">E-pošta</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Broj telefona</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Ukupno termina</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Ukupna zarada</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Nije se pojavio</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-3">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, idx) => (
              <tr
                key={client.id}
                onClick={() => onClientClick(client)}
                className="border-b border-border-subtle cursor-pointer hover:bg-bg-secondary/50 hover:border-primary/20 transition-all group"
                style={{ animation: `slide-up 0.2s ease-out ${idx * 30}ms both` }}
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${
                      client.isActive ? 'bg-primary-muted text-primary' : 'bg-bg-secondary text-text-tertiary'
                    }`}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">{client.name}</div>
                      <div className="text-[11px] text-text-tertiary truncate">{client.vehicles[0]?.plate || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-sm text-text-secondary">{client.email || '/'}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Phone size={13} className="text-text-tertiary" />{client.phone || '/'}
                  </div>
                </td>
                <td className="px-3 py-3.5 text-sm text-text-secondary">{client.totalAppointments || 0}</td>
                <td className="px-3 py-3.5 text-sm text-text-secondary">{client.totalEarnings ? `${client.totalEarnings.toFixed(2)} ${client.currency || 'RSD'}` : '0.00 RSD'}</td>
                <td className="px-3 py-3.5">
                  {(client.noShow ?? 0) > 0 ? (
                    <div className="flex items-center gap-1 text-[12px] text-warning font-semibold">
                      <AlertTriangle size={12} /> {client.noShow}x nedolazak
                    </div>
                  ) : <span className="text-text-tertiary text-sm">—</span>}
                </td>
                <td className="px-3 py-3.5">
                  <span className={`text-[12px] font-semibold ${client.isActive ? 'text-success' : 'text-danger'}`}>{client.isActive ? 'Aktivan' : 'Neaktivan'}</span>
                </td>
                <td className="px-3 py-3.5">
                  <ChevronRight size={17} className="text-text-tertiary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState search={search} />}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden flex-1 overflow-auto px-4 py-4 space-y-3">
        {filtered.map((client, idx) => (
          <div
            key={client.id}
            onClick={() => onClientClick(client)}
            className="card-hover bg-bg-card border border-border rounded-2xl p-4 active:bg-bg-secondary cursor-pointer"
            style={{ animation: `slide-up 0.2s ease-out ${idx * 30}ms both` }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                client.isActive ? 'bg-primary-muted text-primary' : 'bg-bg-secondary text-text-tertiary'
              }`}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{client.name}</div>
                <div className="text-[12px] text-text-secondary mt-0.5">{client.phone}</div>
                {client.vehicles[0] && (
                  <div className="text-[11px] text-text-tertiary mt-1">{client.vehicles[0].make} {client.vehicles[0].model} · {client.vehicles[0].plate}</div>
                )}
              </div>
              {!client.isActive && <Ban size={14} className="text-danger flex-shrink-0" />}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState search={search} />}
      </div>
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center">
          <Users size={32} className="opacity-30" />
        </div>
      </div>
      <p className="text-sm font-bold text-text-secondary">{search ? 'Nema rezultata' : 'Nema klijenata'}</p>
      <p className="text-[12px] mt-1">{search ? 'Pokušaj sa drugim kriterijumom' : 'Klikni „Novi klijent" da dodaš prvog'}</p>
    </div>
  );
}

