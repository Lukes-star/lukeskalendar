import {
  ArrowRight, CalendarDays, CheckCircle2, Clock3, Plus, Users, XCircle,
} from 'lucide-react';
import { Appointment, Client } from '@/types/calendar';
import { dateToISO, MONTHS, WEEKDAYS_FULL } from '@/lib/calendar';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  onOpenCalendar: () => void;
  onOpenClients: () => void;
  onOpenAppointments: () => void;
  onNewAppointment: () => void;
}

export function Dashboard({ appointments, clients, onOpenCalendar, onOpenClients, onOpenAppointments, onNewAppointment }: DashboardProps) {
  const today = new Date();
  const todayIso = dateToISO(today);
  const todayAppointments = appointments.filter((appointment) => appointment.date === todayIso);
  const scheduled = appointments.filter((appointment) => appointment.status === 'scheduled').length;
  const completed = appointments.filter((appointment) => appointment.status === 'completed').length;
  const cancelled = appointments.filter((appointment) => appointment.status === 'cancelled').length;
  const upcoming = appointments
    .filter((appointment) => appointment.date >= todayIso && appointment.status !== 'cancelled')
    .sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`))
    .slice(0, 5);

  const dateLabel = `${WEEKDAYS_FULL[(today.getDay() + 6) % 7]}, ${today.getDate()} ${MONTHS[today.getMonth()].toLowerCase()}`;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-primary">Pregled servisa</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mt-1">Kontrolna tabla</h1>
            <p className="text-sm text-text-secondary mt-1 capitalize">{dateLabel}</p>
          </div>
          <button onClick={onNewAppointment} className="press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover shadow-btn">
            <Plus size={17} /> Zakaži termin
          </button>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <MetricCard icon={<CalendarDays size={18} />} label="Danas" value={todayAppointments.length} detail="termina danas" tone="primary" />
          <MetricCard icon={<Clock3 size={18} />} label="Zakazano" value={scheduled} detail="aktivnih termina" tone="warning" />
          <MetricCard icon={<Users size={18} />} label="Klijenti" value={clients.length} detail="ukupno u bazi" tone="success" />
          <MetricCard icon={<CheckCircle2 size={18} />} label="Završeno" value={completed} detail={`${cancelled} otkazano`} tone="info" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-5">
          <section className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
              <div>
                <h2 className="text-sm font-extrabold text-text-primary">Naredni termini</h2>
                <p className="text-[12px] text-text-tertiary mt-1">Najbliža zakazivanja iz kalendara</p>
              </div>
              <button onClick={onOpenAppointments} className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-hover">
                Svi termini <ArrowRight size={14} />
              </button>
            </div>
            {upcoming.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {upcoming.map((appointment) => <UpcomingRow key={appointment.id} appointment={appointment} />)}
              </div>
            ) : (
              <EmptyDashboard onNewAppointment={onNewAppointment} />
            )}
          </section>

          <section className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle">
              <h2 className="text-sm font-extrabold text-text-primary">Brze akcije</h2>
              <p className="text-[12px] text-text-tertiary mt-1">Najčešće korišćeni ekrani</p>
            </div>
            <div className="p-4 space-y-2">
              <QuickAction icon={<CalendarDays size={17} />} label="Otvori kalendar" onClick={onOpenCalendar} />
              <QuickAction icon={<Users size={17} />} label="Pregledaj klijente" onClick={onOpenClients} />
              <QuickAction icon={<Clock3 size={17} />} label="Svi termini" onClick={onOpenAppointments} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: number; detail: string; tone: 'primary' | 'warning' | 'success' | 'info' }) {
  const tones = {
    primary: 'text-primary bg-primary-muted',
    warning: 'text-warning bg-warning-muted',
    success: 'text-success bg-success-muted',
    info: 'text-blue-400 bg-blue-400/10',
  };
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 text-text-tertiary">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums">{value}</div>
      <p className="text-[11px] text-text-tertiary mt-1">{detail}</p>
    </div>
  );
}

function UpcomingRow({ appointment }: { appointment: Appointment }) {
  const date = new Date(`${appointment.date}T00:00`);
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-secondary/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-primary-muted text-primary flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[13px] font-extrabold leading-none">{date.getDate()}</span>
        <span className="text-[9px] uppercase font-bold mt-0.5">{MONTHS[date.getMonth()].slice(0, 3)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-primary truncate">{appointment.clientName || 'Termin bez imena'}</p>
        <p className="text-[12px] text-text-tertiary truncate mt-0.5">{appointment.serviceName || 'Usluga nije navedena'}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[12px] font-bold text-text-secondary">{appointment.startTime || '—'}</p>
        <StatusBadge status={appointment.status} size="sm" />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl border border-border-subtle text-left text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
      <span className="text-primary">{icon}</span>
      <span className="flex-1">{label}</span>
      <ArrowRight size={15} className="text-text-tertiary" />
    </button>
  );
}

function EmptyDashboard({ onNewAppointment }: { onNewAppointment: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
      <XCircle size={28} className="text-text-tertiary opacity-50" />
      <p className="text-sm font-bold text-text-secondary mt-3">Nema narednih termina</p>
      <button onClick={onNewAppointment} className="text-[12px] text-primary font-bold mt-2 hover:text-primary-hover">Zakaži prvi termin</button>
    </div>
  );
}
