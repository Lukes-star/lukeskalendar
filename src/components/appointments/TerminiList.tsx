import { useState, useMemo } from 'react';
import {
  Search, Filter, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Check, CalendarDays, Download,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/calendar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WEEKDAYS_FULL } from '@/lib/calendar';

interface TerminiListProps {
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
  onRefresh: () => void;
}

type StatusFilter = 'all' | AppointmentStatus;
const PAGE_SIZES = [15, 25, 50];

function formatDateLabel(date: string) {
  const d = new Date(date + 'T00:00');
  const dayName = WEEKDAYS_FULL[(d.getDay() + 6) % 7].toUpperCase();
  const dateStr = `${String(d.getDate()).padStart(2, '0')}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${d.getFullYear()}`;
  return { dayName, dateStr };
}

export function TerminiList({ appointments, onAppointmentClick, onRefresh }: TerminiListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    let r = [...appointments].sort((a, b) => b.date.localeCompare(a.date));
    if (statusFilter !== 'all') r = r.filter((a) => a.status === statusFilter);
    if (fromDate) r = r.filter((a) => a.date >= fromDate);
    if (toDate) r = r.filter((a) => a.date <= toDate);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q) ||
          (a.clientPhone || '').includes(q) ||
          (a.note || '').toLowerCase().includes(q) ||
          (a.employeeName || '').toLowerCase().includes(q),
      );
    }
    return r;
  }, [appointments, statusFilter, search, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilters = statusFilter !== 'all' ? 1 : 0;

  function exportCsv() {
    const header = ['Klijent', 'Telefon', 'Usluga', 'Datum', 'Vreme', 'Status', 'Napomena'];
    const rows = filtered.map((appointment) => [
      appointment.clientName, appointment.clientPhone, appointment.serviceName,
      appointment.date, appointment.startTime || '', appointment.status, appointment.note || '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `termini-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full px-4 md:px-6 py-4 md:py-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Termini</h1>
        </div>
        <span className="text-[12px] text-text-tertiary">{appointments.length} ukupno</span>
        <div className="hidden" />
        <button onClick={onRefresh} className="press text-text-secondary hover:text-primary p-2 rounded-lg hover:bg-bg-secondary transition-colors ml-auto">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex-1 min-h-0 bg-bg-card border border-primary/20 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border-subtle">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pretraga..."
            className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`press flex items-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-colors ${filterOpen ? 'bg-bg-hover border-primary/40 text-text-primary' : 'bg-bg-secondary border-border text-text-primary hover:bg-bg-hover'}`}
          >
            <Filter size={15} />
            Filtriraj po...
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">{activeFilters}</span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-bg-card border border-border rounded-xl shadow-dropdown p-2 min-w-[180px] anim-fade-in">
              {[
                { id: 'all' as StatusFilter, label: 'Svi statusi' },
                { id: 'scheduled' as StatusFilter, label: 'Zakazano' },
                { id: 'in_progress' as StatusFilter, label: 'U toku' },
                { id: 'completed' as StatusFilter, label: 'Završeno' },
                { id: 'cancelled' as StatusFilter, label: 'Otkazano' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setStatusFilter(opt.id); setFilterOpen(false); setPage(1); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === opt.id ? 'bg-primary-muted text-primary font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'}`}
                >
                  {opt.label}
                  {statusFilter === opt.id && <Check size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-bg-card z-10">
              <tr className="border-b border-border-subtle">
                <Th>Klijent</Th>
                <Th>Servis</Th>
                <Th>Beleška</Th>
                <Th>Broj telefona</Th>
                <Th>Datum</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((apt) => {
                const { dayName, dateStr } = formatDateLabel(apt.date);
                return (
                  <tr
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className="border-b border-border-subtle hover:bg-bg-secondary/40 hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-bold text-text-primary">{apt.clientName}</div>
                      <div className="text-[11px] text-text-tertiary">{apt.employeeName || 'Servis'}</div>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary max-w-[180px]">
                      <span className="truncate block">{apt.serviceName}</span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-tertiary max-w-[200px]">
                      <span className="truncate block">{apt.note || '/'}</span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                      {apt.clientPhone || '/'}
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-text-secondary whitespace-nowrap">
                      <div className="font-semibold text-text-primary">{dayName}</div>
                      <div className="text-text-tertiary mt-0.5">{dateStr}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
              <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
                <Search size={32} className="opacity-30" />
              </div>
              <p className="text-sm font-bold text-text-secondary">Nema termina</p>
              <p className="text-[12px] mt-1">{search ? 'Pokušaj sa drugom pretragom' : 'Zakaži prvi termin'}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
          <span className="text-[13px] text-text-secondary">
            Rezultati: <b className="text-text-primary">{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)}</b> od ukupno <b className="text-text-primary">{filtered.length}</b>
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-bg-secondary border border-border rounded-lg py-1.5 pl-3 pr-7 text-sm text-text-primary focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 text-text-tertiary pointer-events-none" />
            </div>
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 transition-colors"><ChevronFirst size={15} /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 transition-colors"><ChevronLeft size={15} /></button>
            <span className="text-sm font-semibold text-text-primary px-2 min-w-[40px] text-center">{page}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 transition-colors"><ChevronRight size={15} /></button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-secondary disabled:opacity-30 transition-colors"><ChevronLast size={15} /></button>
          </div>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="Od datuma" className="flex-1 min-w-[145px] bg-bg-secondary border border-border rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-primary/50" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="Do datuma" className="flex-1 min-w-[145px] bg-bg-secondary border border-border rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-primary/50" />
        </div>
          <button onClick={exportCsv} title="Izvezi filtrirane termine" className="press p-2.5 rounded-xl border border-border text-text-secondary hover:text-primary hover:bg-bg-secondary transition-colors">
            <Download size={16} />
          </button>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden flex-1 overflow-auto px-4 py-4 space-y-3">
        {paginated.map((apt) => {
          const { dayName, dateStr } = formatDateLabel(apt.date);
          return (
            <div
              key={apt.id}
              onClick={() => onAppointmentClick(apt)}
              className="card-hover bg-bg-card border border-border rounded-2xl p-4 active:bg-bg-secondary cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-text-primary">{apt.clientName}</p>
                  <p className="text-[12px] text-text-secondary">{apt.serviceName}</p>
                </div>
                <StatusBadge status={apt.status} size="sm" />
              </div>
              <div className="flex items-center justify-between text-[12px] text-text-tertiary">
                <span>{apt.clientPhone}</span>
                <span>{dayName}</span>
              </div>
              <div className="text-[11px] text-text-tertiary mt-0.5">{dateStr}</div>
              {apt.note && <p className="text-[11px] text-text-tertiary mt-1 truncate">{apt.note}</p>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
            <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
              <CalendarDays size={28} className="opacity-30" />
            </div>
            <p className="text-sm font-bold text-text-secondary">Nema termina</p>
            <p className="text-[12px] mt-1">Zakaži prvi termin</p>
          </div>
        )}
        <div className="flex items-center justify-center gap-3 py-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-bg-secondary disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-sm text-text-secondary">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg bg-bg-secondary disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 first:px-5 py-3">{children}</th>
  );
}
