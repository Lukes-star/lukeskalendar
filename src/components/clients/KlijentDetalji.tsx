import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, Edit3, Phone, Car, Calendar, FileText,
  User, Clock, Plus, Ban, CheckCircle2, AlertTriangle, StickyNote, Trash2,
} from 'lucide-react';
import { Client, Appointment } from '@/types/calendar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { WEEKDAYS_FULL, MONTHS } from '@/lib/calendar';

interface KlijentDetaljiProps {
  client: Client;
  appointments: Appointment[];
  onBack: () => void;
  onEdit: () => void;
  onToggleActive: (id: string) => void;
  onAppointmentClick: (apt: Appointment) => void;
  onAddVehicle: () => void;
  onDelete: (id: string) => void;
  onSaveNote: (client: Client) => void;
}

type Tab = 'pregled' | 'termini' | 'vozila' | 'napomene';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'pregled', label: 'Pregled', icon: <User size={16} /> },
  { id: 'termini', label: 'Termini', icon: <Calendar size={16} /> },
  { id: 'vozila', label: 'Vozila', icon: <Car size={16} /> },
  { id: 'napomene', label: 'Napomene', icon: <FileText size={16} /> },
];

export function KlijentDetalji({
  client, appointments, onBack, onEdit, onToggleActive, onAppointmentClick, onAddVehicle, onDelete, onSaveNote,
}: KlijentDetaljiProps) {
  const [tab, setTab] = useState<Tab>('pregled');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteDraft, setNoteDraft] = useState(client.note || '');

  useEffect(() => setNoteDraft(client.note || ''), [client.id, client.note]);

  const clientAppointments = useMemo(
    () => appointments.filter((a) => a.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date)),
    [appointments, client.id],
  );

  const completed = clientAppointments.filter((a) => a.status === 'completed').length;
  const scheduled = clientAppointments.filter((a) => a.status === 'scheduled').length;
  const noShow = client.noShow || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="press flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <ChevronLeft size={18} />
            Nazad
          </button>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${client.isActive ? '' : ''}`}
              style={client.isActive
                ? { background: 'linear-gradient(135deg, rgba(225,29,45,0.2) 0%, rgba(225,29,45,0.05) 100%)', border: '1px solid rgba(225,29,45,0.15)' }
                : { background: 'rgba(26,34,56,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className={client.isActive ? 'text-primary' : 'text-text-tertiary'}>{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-text-primary truncate tracking-tight">{client.name}</h1>
                {!client.isActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-danger font-semibold px-2 py-0.5 rounded-full bg-danger-muted">
                    <Ban size={11} /> Neaktivan
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-secondary">{client.phone}</p>
            </div>
          </div>
          <Button variant="secondary" size="md" icon={<Edit3 size={16} />} onClick={onEdit}>Izmeni</Button>
          <Button
            variant={client.isActive ? 'danger' : 'secondary'}
            size="md"
            icon={client.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
            onClick={() => onToggleActive(client.id)}
          >
            {client.isActive ? 'Blokiraj' : 'Aktiviraj'}
          </Button>
          <Button
            variant="danger"
            size="md"
            icon={<Trash2 size={16} />}
            onClick={() => setConfirmDelete(true)}
          >
            Obriši
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 border-b border-border-subtle">
        <StatCard label="Ukupno" value={clientAppointments.length} icon={<Calendar size={16} />} color="#3B82F6" />
        <StatCard label="Završeno" value={completed} icon={<CheckCircle2 size={16} />} color="#22C55E" />
        <StatCard label="Zakazano" value={scheduled} icon={<Clock size={16} />} color="#F59E0B" />
        <StatCard label="Nedolazaka" value={noShow} icon={<AlertTriangle size={16} />} color="#EF4444" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-border-subtle overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 py-2 px-4 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
              tab === t.id ? 'text-text-primary bg-primary-muted' : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto px-6 py-5" key={tab}>
        <div className="max-w-2xl anim-fade-in">
          {tab === 'pregled' && (
            <div className="space-y-2">
              <InfoRow icon={<User size={16} />} label="Ime" value={client.name} />
              <InfoRow icon={<Phone size={16} />} label="Telefon" value={client.phone} />
              <InfoRow icon={<Car size={16} />} label="Vozila" value={`${client.vehicles.length}`} />
              {client.createdAt && <InfoRow icon={<Calendar size={16} />} label="Klijent od" value={formatDate(client.createdAt)} />}
              {client.note && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-bg-card border border-border">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <StickyNote size={16} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Napomena</div>
                    <div className="text-sm text-text-secondary mt-0.5 leading-relaxed">{client.note}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'termini' && (
            <div className="space-y-2">
              {clientAppointments.map((apt, i) => (
                <div
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="card-hover flex items-center gap-3 p-4 rounded-2xl bg-bg-card border border-border cursor-pointer"
                  style={{ animation: `slide-up 0.2s ease-out ${i * 30}ms both` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center flex-shrink-0">
                    <Car size={18} className="text-text-tertiary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{apt.serviceName}</p>
                    <p className="text-[12px] text-text-tertiary mt-0.5">
                      {apt.vehicle.make} {apt.vehicle.model} · {apt.vehicle.plate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-text-tertiary">{formatDate(apt.date)}</p>
                    <div className="mt-1"><StatusBadge status={apt.status} size="sm" /></div>
                  </div>
                </div>
              ))}
              {clientAppointments.length === 0 && (
                <EmptyState icon={<Calendar size={28} />} title="Nema termina" subtitle="Zakaži prvi termin za ovog klijenta" />
              )}
            </div>
          )}

          {tab === 'vozila' && (
            <div className="space-y-2">
              {client.vehicles.map((v, i) => (
                <div
                  key={i}
                  className="card-hover flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border"
                  style={{ animation: `slide-up 0.2s ease-out ${i * 30}ms both` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    <Car size={22} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{v.make} {v.model}</p>
                    <p className="text-[12px] text-text-tertiary mt-0.5">Registracija: <span className="font-mono font-semibold text-text-secondary">{v.plate}</span></p>
                    {v.year && <p className="text-[11px] text-text-tertiary mt-0.5">Godina: {v.year}</p>}
                  </div>
                </div>
              ))}
              {client.vehicles.length === 0 && (
                <EmptyState icon={<Car size={28} />} title="Nema vozila" subtitle="Dodaj vozilo da bi ga zakazao" />
              )}
              <button
                onClick={onAddVehicle}
                className="press w-full flex items-center gap-2 p-4 rounded-2xl border border-dashed border-border text-text-secondary hover:text-primary hover:border-primary/40 hover:bg-primary-muted/30 transition-all"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">Dodaj vozilo</span>
              </button>
            </div>
          )}

          {tab === 'napomene' && (
            <div>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Dodaj napomenu o klijentu..."
                className="w-full min-h-[160px] bg-bg-card border border-border rounded-2xl p-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={() => onSaveNote({ ...client, note: noteDraft.trim() || undefined })}>Sačuvaj napomenu</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-bg-card border border-danger/30 shadow-2xl p-6 anim-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-danger-muted">
                <Trash2 size={22} className="text-danger" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary">Obrisati klijenta?</h3>
                <p className="text-[12px] text-text-tertiary mt-0.5">Ova akcija je nepovratna.</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-5">
              Da li ste sigurni da želite da obrišete klijenta <span className="font-bold text-text-primary">{client.name}</span>? Svi podaci će biti trajno uklonjeni.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => setConfirmDelete(false)}>Otkaži</Button>
              <Button variant="danger" size="md" className="flex-1" icon={<Trash2 size={16} />} onClick={() => onDelete(client.id)}>
                Obriši
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card-hover bg-bg-card border border-border rounded-2xl p-3.5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5" style={{ background: color }} />
      <div className="flex items-center gap-2 mb-1.5 relative">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-text-primary tabular-nums relative">{value}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-card border border-border">
      <div className="w-9 h-9 rounded-lg bg-bg-secondary flex items-center justify-center text-text-tertiary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-text-primary truncate">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
      <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-bold text-text-secondary">{title}</p>
      <p className="text-[12px] mt-1">{subtitle}</p>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00');
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
