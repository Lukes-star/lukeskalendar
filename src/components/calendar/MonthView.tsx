import { useState, useMemo, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Appointment } from '@/types/calendar';
import {
  getMonthGrid, isToday, isWeekend, getAppointmentsForDate,
  WEEKDAYS_SHORT, dateToISO,
} from '@/lib/calendar';
import { getHolidayForDate } from '@/lib/churchCalendar';
import { AppointmentPill } from './AppointmentPill';

interface NoteMarker {
  id: string;
  content: string;
  date: string;
  reminder_time: string;
  is_triggered: boolean;
}

interface MonthViewProps {
  year: number;
  month: number;
  appointments: Appointment[];
  notes?: NoteMarker[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDayClick: (date: Date) => void;
  onMonthSwipe?: (direction: 'prev' | 'next') => void;
}

function isBlockedDate(date: Date): boolean {
  return date.getMonth() === 10 && [6, 7, 8, 9, 10].includes(date.getDate());
}

export function MonthView({ year, month, appointments, notes, onAppointmentClick, onDayClick, onMonthSwipe }: MonthViewProps) {
  const grid = getMonthGrid(year, month);
  const [overflowDay, setOverflowDay] = useState<string | null>(null);
  const [holidayTooltip, setHolidayTooltip] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const wasSwipe = useRef(false);
  const lastMonthChange = useRef(0);

  function changeMonth(direction: 'prev' | 'next') {
    if (!onMonthSwipe || Date.now() - lastMonthChange.current < 350) return;
    lastMonthChange.current = Date.now();
    onMonthSwipe(direction);
  }

  const holidayMap = useMemo(() => {
    const map = new Map<string, { name: string; importance: string; fasting?: boolean; note?: string; kind?: string }>();
    for (const cell of grid) {
      const h = getHolidayForDate(cell.date);
      if (h) map.set(dateToISO(cell.date), { name: h.name, importance: h.importance, fasting: h.fasting, note: h.note, kind: h.kind });
    }
    return map;
  }, [grid]);

  const notesByDate = useMemo(() => {
    const map = new Map<string, NoteMarker[]>();
    for (const n of notes || []) {
      const arr = map.get(n.date) || [];
      arr.push(n);
      map.set(n.date, arr);
    }
    return map;
  }, [notes]);

  return (
    <div className="flex flex-col h-full px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
      <div className="grid grid-cols-7 mb-0 border-t border-border">
        {WEEKDAYS_SHORT.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[9px] sm:text-[11px] font-bold uppercase tracking-wider py-2 sm:py-2.5 border-b border-border border-r last:border-r-0 ${
              i >= 5 ? 'text-red-400/70' : 'text-text-tertiary'
            }`}
          >
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      <div
        key={`${year}-${month}`}
        className="grid grid-cols-7 flex-1 min-h-0 stagger"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null || !onMonthSwipe) return;
          const delta = event.changedTouches[0]?.clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) > 55) {
            wasSwipe.current = true;
            changeMonth(delta > 0 ? 'prev' : 'next');
          }
        }}
        onClick={(event) => {
          if (!wasSwipe.current) return;
          event.preventDefault();
          event.stopPropagation();
          wasSwipe.current = false;
        }}
      >
        {grid.map((cell, idx) => {
          const blocked = isBlockedDate(cell.date);
          const dayAppts = blocked ? [] : getAppointmentsForDate(appointments, cell.date);
          const today = isToday(cell.date);
          const weekend = isWeekend(cell.date);
          const maxVisible = dayAppts.length > 3 ? 4 : 3;
          const visible = dayAppts.slice(0, maxVisible);
          const overflow = dayAppts.length - maxVisible;
          const iso = dateToISO(cell.date);
          const holiday = holidayMap.get(iso);
          const dayNotes = notesByDate.get(iso) || [];
          const hasActiveNote = dayNotes.some((n) => !n.is_triggered);
          const isLastCol = (idx % 7) === 6;
          const isLastRow = idx >= 35;
          const dim = !cell.isCurrentMonth;

          return (
            <div
              key={idx}
              onClick={() => {
                if (blocked) return;
                onDayClick(cell.date);
              }}
              className={`group relative flex flex-col transition-colors duration-100 min-h-[56px] sm:min-h-[84px] lg:min-h-[112px] p-1 sm:p-1.5 lg:p-2 ${
                blocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:brightness-110'
              } ${
                !isLastCol ? 'border-r border-border' : ''
              } ${!isLastRow ? 'border-b border-border' : ''} ${
                dim ? 'opacity-50' : ''
              }`}
              style={
                holiday
                  ? {
                      background: today
                        ? 'linear-gradient(180deg, rgba(225,29,46,0.28) 0%, rgba(245,158,11,0.28) 100%)'
                        : 'linear-gradient(180deg, rgba(245,158,11,0.30) 0%, rgba(127,29,29,0.22) 100%)',
                      boxShadow: today ? 'inset 0 0 0 2px rgba(225,29,46,0.7)' : 'inset 0 0 0 1px rgba(250,204,21,0.55)',
                    }
                  : {
                      background: today
                        ? 'rgba(59,130,246,0.10)'
                        : hasActiveNote
                          ? 'rgba(239,68,68,0.08)'
                          : dayAppts.length > 0
                            ? 'rgba(255,255,255,0.035)'
                            : weekend
                              ? 'rgba(0,0,0,0.18)'
                              : 'transparent',
                    }
              }
            >
              {hasActiveNote && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 z-10">
                  <div className="relative flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 shadow-sm" style={{ animation: 'pulse-red 2s ease-in-out infinite' }}>
                    <Bell size={8} className="text-white" />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-0.5 sm:mb-1 gap-1">
                <span
                  className={`flex items-center justify-center text-[10px] sm:text-[12px] lg:text-[13px] font-bold ${
                    today
                      ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-white shadow-btn'
                      : holiday
                        ? 'text-amber-200'
                        : weekend
                          ? 'text-red-400/80'
                          : 'text-text-primary'
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {dayAppts.length > 0 && (
                  <span className="hidden sm:inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary/20 text-[9px] font-bold text-primary tabular-nums">
                    {dayAppts.length}
                  </span>
                )}
              </div>

              {holiday && (
                <button
                  type="button"
                  onMouseEnter={() => setHolidayTooltip(iso)}
                  onMouseLeave={() => setHolidayTooltip(null)}
                  onClick={(e) => { e.stopPropagation(); setHolidayTooltip(holidayTooltip === iso ? null : iso); }}
                  className="text-left mb-0.5 sm:mb-1"
                  title={holiday.name}
                >
                  <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-amber-300/35 bg-black/15 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-amber-100 truncate leading-tight tracking-tight">
                    <span className="text-amber-300">★</span> {holiday.name}
                  </span>
                </button>
              )}

              {holidayTooltip === iso && holiday && (
                <div
                  className="absolute z-40 top-8 left-1 mt-1 w-48 bg-bg-card border border-amber-500/30 rounded-lg shadow-dropdown p-2 anim-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-bold text-amber-400">
                      {holiday.kind === 'national' ? 'Državni praznik' : 'Crkveni praznik'}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-text-primary">{holiday.name}</p>
                  {holiday.note && <p className="text-[10px] text-text-tertiary mt-0.5 leading-snug">{holiday.note}</p>}
                  {holiday.fasting && <p className="text-[10px] text-warning mt-0.5 font-medium">Post</p>}
                </div>
              )}

              <div className="flex flex-col gap-0.5 flex-1 min-h-0">
                {visible.map((apt) => (
                  <AppointmentPill
                    key={apt.id}
                    appointment={apt}
                    onClick={(e, a) => { e.stopPropagation(); onAppointmentClick(a); }}
                    compact={dayAppts.length > 2}
                  />
                ))}

                {overflow > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setOverflowDay(iso); }}
                    className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold text-primary hover:text-primary-hover transition-colors text-left px-1 mt-0.5 rounded-md hover:bg-primary-muted"
                  >
                    <span>+{overflow} još termina</span>
                    <span aria-hidden="true">›</span>
                  </button>
                )}
              </div>

              {overflowDay === iso && (
                <div
                  className="absolute z-30 top-full left-0 mt-1 w-64 bg-bg-card border border-border rounded-xl shadow-dropdown p-2 space-y-1 anim-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] font-bold text-text-primary px-1 pb-1">
                    {cell.date.getDate()}. {WEEKDAYS_SHORT[(cell.date.getDay() + 6) % 7]}
                    {holiday ? ` · ${holiday.name}` : ''}
                  </div>
                  {dayAppts.map((apt) => (
                    <AppointmentPill
                      key={apt.id}
                      appointment={apt}
                      onClick={(e, a) => { e.stopPropagation(); setOverflowDay(null); onAppointmentClick(a); }}
                    />
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); setOverflowDay(null); }}
                    className="w-full text-[11px] text-text-secondary hover:text-text-primary py-1 transition-colors"
                  >
                    Zatvori
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
