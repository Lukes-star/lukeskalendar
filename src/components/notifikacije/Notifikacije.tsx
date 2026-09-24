import { useState } from 'react';
import {
  Bell, MessageCircle, Check, Calendar, Send, XCircle, ExternalLink,
} from 'lucide-react';
import { Appointment } from '@/types/calendar';
import { MONTHS, WEEKDAYS_FULL } from '@/lib/calendar';

interface NotifikacijeProps {
  appointments: Appointment[];
}

function buildMessage(apt: Appointment, tomorrow: Date): string {
  const dateLabel = tomorrow.toLocaleDateString('sr-RS', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const timeLabel = apt.startTime ? ` u ${apt.startTime}` : '';
  return `Poštovani/a ${apt.clientName}, podsetnik: zakazan je termin za ${apt.serviceName} dana ${dateLabel}${timeLabel}. Servis Farova Čaki. Vidimo se!`;
}

function phoneToWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  else if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0')) cleaned = '381' + cleaned.slice(1);
  return cleaned;
}

export function Notifikacije({ appointments }: NotifikacijeProps) {
  const [enabled, setEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sendError, setSendError] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const upcoming = appointments
    .filter((a) => a.date === tomorrowStr && a.status === 'scheduled')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  function openWhatsApp(apt: Appointment) {
    const phone = phoneToWhatsApp(apt.clientPhone);
    if (!phone || phone.length < 8) {
      setSendError(`Klijent ${apt.clientName} nema ispravan broj telefona.`);
      return;
    }
    const msg = encodeURIComponent(buildMessage(apt, tomorrow));
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, '_blank');
    setSentIds((prev) => new Set(prev).add(apt.id));
    setSendError(null);
  }

  function sendAll() {
    if (upcoming.length === 0) {
      setSendError('Nema termina za sutra — nemate kome poslati podsetnik.');
      return;
    }
    upcoming.forEach((apt, idx) => {
      setTimeout(() => openWhatsApp(apt), idx * 1200);
    });
  }

  const allSent = upcoming.length > 0 && upcoming.every((a) => sentIds.has(a.id));

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.04) 100%)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <Bell size={22} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Notifikacije</h1>
            <p className="text-[13px] text-text-tertiary">Podsetnici za klijente preko WhatsApp-a</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-2xl p-4 mb-5">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={18} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-text-primary">Slanje preko WhatsApp-a</p>
          <p className="text-[12px] text-text-tertiary mt-0.5 leading-relaxed">
            Klikom na dugme otvara se WhatsApp sa gotovom porukom za svakog klijenta.
            Samo pritisnite "Pošalji" u WhatsApp-u i podsetnik je gotov.
          </p>
        </div>
      </div>

      {/* Settings card */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-extrabold text-text-primary">Podešavanja</h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <p className="text-sm font-semibold text-text-primary">Automatski podsetnici</p>
            <p className="text-[12px] text-text-tertiary mt-0.5">Podsetnik dan pre termina</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-success' : 'bg-bg-secondary border border-border'}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>

        {/* Reminder time */}
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-text-primary mb-2">Kada slati podsetnik</p>
          <div className="grid grid-cols-3 gap-2">
            {[12, 24, 48].map((h) => (
              <button
                key={h}
                onClick={() => setReminderHours(h)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  reminderHours === h
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary border border-border text-text-secondary hover:bg-hover'
                }`}
              >
                {h === 24 ? 'Dan pre' : `${h}h pre`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tomorrow's appointments */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-text-primary">Termini za sutra</h2>
            <p className="text-[12px] text-text-tertiary mt-0.5 capitalize">
              {tomorrow.getDate()}. {MONTHS[tomorrow.getMonth()].toLowerCase()} · {WEEKDAYS_FULL[(tomorrow.getDay() + 6) % 7].toLowerCase()}
            </p>
          </div>
          <span className="text-[12px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {upcoming.length} termina
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Calendar size={32} className="text-text-tertiary mx-auto mb-2" />
            <p className="text-sm text-text-tertiary">Nema zakazanih termina za sutra</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {upcoming.map((apt) => {
              const isSent = sentIds.has(apt.id);
              return (
                <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 ${isSent ? 'bg-green-500/10' : 'bg-bg-secondary'}`}>
                    {isSent ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <span className="text-[14px] font-bold text-text-primary">{new Date(apt.date + 'T00:00').getDate()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{apt.clientName}</p>
                    <p className="text-[12px] text-text-tertiary truncate">
                      {apt.serviceName}{apt.startTime ? ` · ${apt.startTime}` : ''}
                    </p>
                  </div>
                  <span className="text-[12px] text-text-secondary font-medium tabular-nums hidden sm:block">{apt.clientPhone}</span>
                  <button
                    onClick={() => openWhatsApp(apt)}
                    disabled={!enabled}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-[13px] font-bold transition-all flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none ${
                      isSent
                        ? 'bg-green-500/10 text-green-600 hover:bg-green-500/15'
                        : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <Check size={14} />
                        <span className="hidden sm:inline">Poslato</span>
                        <ExternalLink size={13} className="sm:hidden" />
                      </>
                    ) : (
                      <>
                        <MessageCircle size={14} />
                        <span className="hidden sm:inline">Pošalji</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send all */}
      {upcoming.length > 0 && (
        <button
          onClick={sendAll}
          disabled={!enabled || allSent}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 text-white font-extrabold hover:bg-green-600 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]"
        >
          <Send size={18} />
          {allSent ? 'Svi podsetnici poslati' : 'Pošalji sve podsetnike'}
        </button>
      )}

      {/* Error */}
      {sendError && (
        <div className="mt-4 bg-danger-muted border border-danger/20 rounded-xl p-4 flex items-start gap-2.5">
          <XCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-red-500">Greška</p>
            <p className="text-[13px] text-text-secondary mt-1">{sendError}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {allSent && upcoming.length > 0 && (
        <div className="mt-4 bg-success-muted border border-success/20 rounded-xl p-4 flex items-start gap-2.5">
          <Check size={18} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-green-600">Podsetnici poslati!</p>
            <p className="text-[13px] text-text-secondary mt-1">Svim klijentima za sutra je poslat WhatsApp podsetnik.</p>
          </div>
        </div>
      )}
    </div>
  );
}
