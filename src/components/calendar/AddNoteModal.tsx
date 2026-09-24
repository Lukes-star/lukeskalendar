import { useState, useRef } from 'react';
import { X, Bell, Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { capitalizeFirst } from '@/lib/text';
import { MONTHS, WEEKDAYS_FULL } from '@/lib/calendar';
import { getHolidayForDate } from '@/lib/churchCalendar';

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: { content: string; date: string; reminder_time: string }) => void;
  preselectedDate?: Date;
}

const QUICK_TIMES = [
  { label: '30 min', minutes: 30 },
  { label: '1 h', minutes: 60 },
  { label: '2 h', minutes: 120 },
  { label: 'Sutra 9h', minutes: null, preset: { h: 9, nextDay: true } },
];

export function AddNoteModal({ open, onClose, onSave, preselectedDate }: AddNoteModalProps) {
  const base = preselectedDate || new Date();
  const defaultDate = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;

  const [content, setContent] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [reminderTime, setReminderTime] = useState('');
  const audioUnlocked = useRef(false);

  function unlockAudio() {
    if (!audioUnlocked.current) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        audioUnlocked.current = true;
      } catch { /* ignore */ }
    }
  }

  function applyQuickTime(minutes: number | null, preset?: { h: number; nextDay: boolean }) {
    const now = new Date();
    if (preset) {
      const target = preset.nextDay ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) : now;
      target.setHours(preset.h, 0, 0, 0);
      const dStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      const tStr = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
      setDate(dStr);
      setReminderTime(tStr);
    } else if (minutes != null) {
      const target = new Date(now.getTime() + minutes * 60000);
      const dStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      const tStr = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
      setDate(dStr);
      setReminderTime(tStr);
    }
  }

  function handleSave() {
    if (!content.trim() || !date || !reminderTime) return;
    onSave({ content: capitalizeFirst(content.trim()), date, reminder_time: reminderTime });
    setContent('');
    setReminderTime('');
    onClose();
  }

  function handleClose() {
    setContent('');
    setReminderTime('');
    onClose();
  }

  const selectedDateObj = new Date(date + 'T00:00');
  const dateLabel = `${WEEKDAYS_FULL[(selectedDateObj.getDay() + 6) % 7]}, ${selectedDateObj.getDate()}. ${MONTHS[selectedDateObj.getMonth()].toLowerCase()}`;
  const holiday = date ? getHolidayForDate(selectedDateObj) : null;

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border-subtle bg-gradient-to-r from-amber-500/10 via-transparent to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-400/15 border border-amber-400/30 shadow-sm">
              <Bell size={21} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-primary tracking-tight">Podsetnik</h2>
              <p className="text-[12px] text-text-tertiary mt-0.5">Zakaži podsetnik koji te podseti na vreme</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto" onClick={unlockAudio}>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 block">Beleška</label>
          <textarea
            value={content}
            onChange={(e) => setContent(capitalizeFirst(e.target.value))}
            placeholder="Npr. Pozvati klijenta da potvrdi termin..."
            className="w-full min-h-[104px] bg-bg-secondary border border-border rounded-xl p-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 block">Datum</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-bg-secondary border border-border rounded-xl w-full py-2.5 pl-9 pr-3 text-sm text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 block">Vreme</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-bg-secondary border border-border rounded-xl w-full py-2.5 pl-9 pr-3 text-sm text-text-primary focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {holiday && (
          <div className="flex items-start gap-2 rounded-xl px-3 py-2 border border-amber-400/35 bg-amber-400/15">
            <span className="text-amber-300 text-sm leading-none mt-0.5">★</span>
            <div>
              <p className="text-[12px] font-bold text-amber-200">
                {holiday.kind === 'national' ? 'Državni praznik' : 'Praznik'}: {holiday.name}
              </p>
              {holiday.note && <p className="text-[11px] text-amber-100/70 mt-0.5">{holiday.note}</p>}
            </div>
          </div>
        )}

        {reminderTime && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3.5 py-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center flex-shrink-0">
              <Bell size={15} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-amber-300/80">Podsetnik je podešen</p>
              <p className="text-[13px] text-amber-100 font-bold capitalize truncate">{dateLabel} u {reminderTime}</p>
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 block">Brzo podešavanje</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_TIMES.map((qt) => (
              <button
                key={qt.label}
                onClick={() => applyQuickTime(qt.minutes, qt.preset)}
                className="px-3 py-2 rounded-lg bg-bg-secondary border border-border text-[12px] font-semibold text-text-secondary hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-400/10 transition-all"
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Kada dođe vreme, ekran pocrveni i pusti se alarm. Na kalendaru će dan sa podsetnikom biti obeležen crveno.
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border-subtle bg-bg-card flex flex-col-reverse sm:flex-row gap-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={handleClose} icon={<X size={16} />}>
          Otkaži
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={handleSave} icon={<Check size={16} />} disabled={!content.trim() || !reminderTime}>
          Sačuvaj
        </Button>
      </div>
    </Modal>
  );
}
