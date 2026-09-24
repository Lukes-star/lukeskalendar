import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from 'lucide-react';
import { CalendarView } from '@/types/calendar';
import { formatMonthYear, getTodayLabel, getTodayLabelColor } from '@/lib/calendar';

interface CalendarHeaderProps {
  year: number;
  month: number;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  onViewChange: (view: CalendarView) => void;
}

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: 'month', label: 'Mesec' },
  { id: 'week', label: 'Nedelja' },
  { id: 'day', label: 'Dan' },
];

export function CalendarHeader({
  year, month, view, onPrev, onNext, onToday, onRefresh, onViewChange,
}: CalendarHeaderProps) {
  const title = formatMonthYear(year, month);
  const dayLabel = getTodayLabel();
  const dayColor = getTodayLabelColor();

  return (
    <header className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Nav buttons */}
        <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-xl p-0.5 flex-shrink-0">
          <button
            onClick={onPrev}
            className="press p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Prethodni"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={onNext}
            className="press p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Sledeći"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="hidden sm:block h-8 w-px bg-border flex-shrink-0" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(225,29,45,0.15) 0%, rgba(225,29,45,0.04) 100%)', border: '1px solid rgba(225,29,45,0.12)' }}>
            <CalendarDays size={19} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1
                key={title}
                className="text-base sm:text-xl font-extrabold text-text-primary leading-tight truncate anim-slide-down tracking-tight"
              >
                {title}
              </h1>
              <span
                className="hidden sm:inline-flex items-center text-[13px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                style={{
                  color: dayColor,
                  backgroundColor: `${dayColor}18`,
                }}
              >
                {dayLabel}
              </span>
            </div>
            <span className="sm:hidden text-[12px] font-bold capitalize" style={{ color: dayColor }}>{dayLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* View selector */}
        <div className="hidden sm:flex items-center bg-bg-secondary border border-border rounded-xl p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                view === v.id
                  ? 'bg-primary text-white shadow-btn'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="press p-2 sm:p-2.5 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
          title="Osveži"
        >
          <RefreshCw size={16} />
        </button>

        <button
          onClick={onToday}
          className="press py-2 px-3 sm:px-4 rounded-xl bg-primary text-white text-[13px] sm:text-sm font-bold hover:bg-primary-hover hover:shadow-btn-hover transition-all"
        >
          Danas
        </button>
      </div>
    </header>
  );
}
