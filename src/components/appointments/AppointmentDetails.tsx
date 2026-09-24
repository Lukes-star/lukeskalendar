import {
  User, Phone, Car, Calendar, FileText, Trash2,
  Edit3, CheckCircle2, XCircle, Play, MessageCircle, Send, Clock, X, Wrench,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Appointment, AppointmentStatus } from '@/types/calendar';
import { WEEKDAYS_FULL, MONTHS } from '@/lib/calendar';

interface AppointmentDetailsProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onDelete: (id: string) => void;
  onEdit?: (apt: Appointment) => void;
}

const SR_MONTHS = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
];

function buildMessage(appointment: Appointment): string {
  const date = new Date(appointment.date + 'T00:00');
  const day = date.getDate();
  const monthName = SR_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const time = appointment.startTime || '08:00';

  return (
    `Poštovani ${appointment.clientName},\n\n` +
    `Podsećamo Vas na Vaš zakazani termin.\n\n` +
    ` Datum: ${day}. ${monthName} ${year}.\n` +
    ` Vreme: ${time}\n\n` +
    `Servis Farova Čaki`
  );
}

function sendWhatsApp(appointment: Appointment) {
  const phone = appointment.clientPhone.replace(/\D/g, '');
  const msg = encodeURIComponent(buildMessage(appointment));
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

function sendViber(appointment: Appointment) {
  const msg = encodeURIComponent(buildMessage(appointment));
  window.open(`viber://chat?number=${appointment.clientPhone.replace(/\D/g, '')}&text=${msg}`, '_blank');
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppointmentDetails({ open, appointment, onClose, onStatusChange, onDelete, onEdit }: AppointmentDetailsProps) {
  if (!appointment) return null;

  const date = new Date(appointment.date + 'T00:00');
  const dateLabel = `${WEEKDAYS_FULL[(date.getDay() + 6) % 7]}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}.`;
  const vehicleLabel = [appointment.vehicle?.make, appointment.vehicle?.model].filter(Boolean).join(' ');
  const plate = appointment.vehicle?.plate || '';

  return (
    <Drawer open={open} onClose={onClose} width="max-w-md w-full">
      <div className="relative px-5 sm:px-6 pt-4 pb-5 border-b border-border-subtle">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(225,29,45,0.12) 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-[15px] font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, #E11D2E 0%, #9F1239 100%)', boxShadow: '0 4px 14px rgba(225,29,45,0.28)' }}
            >
              {initials(appointment.clientName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Klijent</p>
                  <h2 className="text-lg font-extrabold text-text-primary tracking-tight truncate leading-tight">
                    {appointment.clientName || 'Nepoznat klijent'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge status={appointment.status} />
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                    aria-label="Zatvori"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              {appointment.clientPhone && (
                <a
                  href={`tel:${appointment.clientPhone}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-primary transition-colors"
                >
                  <Phone size={13} className="text-primary" />
                  {appointment.clientPhone}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { if (onEdit) { onEdit(appointment); onClose(); } }}
              className="press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-secondary border border-border text-sm font-bold text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Edit3 size={15} className="text-primary" />
              Izmeni
            </button>
            <button
              onClick={() => { onDelete(appointment.id); onClose(); }}
              className="press flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-danger-muted border border-danger/25 text-sm font-bold text-danger hover:bg-danger/20 transition-colors"
            >
              <Trash2 size={15} />
              Obriši
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 space-y-2">
        <DetailRow icon={<Wrench size={16} />} label="Usluga" value={appointment.serviceName || '—'} />
        <DetailRow
          icon={<Calendar size={16} />}
          label="Datum"
          value={dateLabel}
          extra={appointment.startTime ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary">
              <Clock size={12} /> {appointment.startTime}
            </span>
          ) : undefined}
        />
        <DetailRow icon={<Car size={16} />} label="Vozilo" value={vehicleLabel || plate || '—'} />
        {plate && vehicleLabel && (
          <DetailRow icon={<Car size={16} />} label="Registracija" value={plate} />
        )}
        {appointment.employeeName && (
          <DetailRow icon={<User size={16} />} label="Radnik" value={appointment.employeeName} />
        )}
        {appointment.imageUrl && (
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1.5">Slika</div>
            <img src={appointment.imageUrl} alt="Termin" className="w-full rounded-xl border border-border" />
          </div>
        )}
        {appointment.note && (
          <div className="pt-1">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary/50 border border-border-subtle">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15 text-primary">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Napomena</div>
                <div className="text-sm font-medium text-text-primary leading-snug">{appointment.note}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border-subtle">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-2.5">Pošalji podsetnik</div>
        <div className="bg-bg-secondary border border-border rounded-xl p-3 mb-3">
          <pre className="text-[12px] text-text-secondary font-sans whitespace-pre-wrap leading-relaxed">
            {buildMessage(appointment)}
          </pre>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sendWhatsApp(appointment)}
            className="press flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border"
            style={{ backgroundColor: '#25D36620', color: '#25D366', borderColor: '#25D36650' }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button
            onClick={() => sendViber(appointment)}
            className="press flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border"
            style={{ backgroundColor: '#7360F220', color: '#7360F2', borderColor: '#7360F250' }}
          >
            <Send size={16} />
            Viber
          </button>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border-subtle">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-2.5">Status</div>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton active={appointment.status === 'scheduled'} icon={<CheckCircle2 size={16} />} label="Zakazan" color="#E11D2E" onClick={() => onStatusChange(appointment.id, 'scheduled')} />
          <ActionButton active={appointment.status === 'in_progress'} icon={<Play size={16} />} label="U toku" color="#F59E0B" onClick={() => onStatusChange(appointment.id, 'in_progress')} />
          <ActionButton active={appointment.status === 'completed'} icon={<CheckCircle2 size={16} />} label="Završen" color="#22C55E" onClick={() => onStatusChange(appointment.id, 'completed')} />
          <ActionButton active={appointment.status === 'cancelled'} icon={<XCircle size={16} />} label="Otkazan" color="#EF4444" onClick={() => onStatusChange(appointment.id, 'cancelled')} />
        </div>
      </div>
    </Drawer>
  );
}

function DetailRow({
  icon, label, value, extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">{label}</div>
        <div className="text-sm font-semibold text-text-primary truncate">{value}</div>
      </div>
      {extra}
    </div>
  );
}

function ActionButton({ active, icon, label, color, onClick }: { active: boolean; icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`press flex items-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold border transition-all ${
        active ? 'border-transparent' : 'border-border bg-bg-secondary text-text-secondary hover:bg-bg-hover'
      }`}
      style={active ? { backgroundColor: `${color}20`, color, borderColor: `${color}50` } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
