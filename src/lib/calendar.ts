import { Appointment, AppointmentStatus } from '@/types/calendar';
import { getHolidayForDate } from '@/lib/churchCalendar';

export const WEEKDAYS_SHORT = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
export const WEEKDAYS_FULL = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
export const MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec',
];

// Konfiguracija za prikaz odmora (6, 7, 8, 9, 10. novembar)
export const VACATION_DAYS_NOVEMBER = [6, 7, 8, 9, 10];

export const VACATION_CONFIG = {
  title: 'ODMOR',
  subtitle: 'CRNA GORA',
  fullText: 'ODMOR\nCRNA GORA',
  color: '#EF4444', // Crvena slova
  bg: 'rgba(239,68,68,0.15)',
  borderColor: '#EF4444',
};

export function isVacationDate(date: Date): boolean {
  const month = date.getMonth(); // 10 = Novembar (meseci su 0-indeksirani: 0=Jan, 10=Nov)
  const day = date.getDate();
  return month === 10 && VACATION_DAYS_NOVEMBER.includes(day);
}

export function getVacationInfo(date: Date) {
  if (isVacationDate(date)) {
    return VACATION_CONFIG;
  }
  return null;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns a 6x7 grid (42 cells) covering the month view, starting Monday
export function getMonthGrid(year: number, month: number): { date: Date; isCurrentMonth: boolean; isVacation: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const cells: { date: Date; isCurrentMonth: boolean; isVacation: boolean }[] = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    cells.push({ date: d, isCurrentMonth: false, isVacation: isVacationDate(d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    cells.push({ date: dateObj, isCurrentMonth: true, isVacation: isVacationDate(dateObj) });
  }
  while (cells.length < 42) {
    const next = cells.length - dayOfWeek - daysInMonth + 1;
    const d = new Date(year, month + 1, next);
    cells.push({ date: d, isCurrentMonth: false, isVacation: isVacationDate(d) });
  }
  return cells;
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function isWeekend(date: Date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export function dateToISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getAppointmentsForDate(appointments: Appointment[], date: Date) {
  if (isVacationDate(date)) return []; // Ne dozvoljava prikaz/zakazivanje termina tokom odmora
  const iso = dateToISO(date);
  return appointments
    .filter((a) => a.date === iso && a.status !== 'cancelled')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export function formatMonthYear(year: number, month: number) {
  return `${MONTHS[month]} ${year}`;
}

export function getTodayLabel() {
  const today = new Date();
  if (isVacationDate(today)) return 'ODMOR - CRNA GORA';
  const dayName = WEEKDAYS_FULL[(today.getDay() + 6) % 7];
  return dayName;
}

export function getTodayLabelColor(): string {
  const today = new Date();
  if (isVacationDate(today)) return '#EF4444';
  const holiday = getHolidayForDate(today);
  if (holiday) return '#F59E0B';
  const d = today.getDay();
  if (d === 0 || d === 6) return '#EF4444';
  return '#9CA3AF';
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 30;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function generateTimeSlots(date: Date): { time: string; type: 'available' | 'booked' | 'break' | 'vacation'; label?: string; color?: string }[] {
  const isVacation = isVacationDate(date);
  const slots: { time: string; type: 'available' | 'booked' | 'break' | 'vacation'; label?: string; color?: string }[] = [];
  
  for (let h = 8; h <= 18; h++) {
    slots.push({
      time: `${String(h).padStart(2, '0')}:00`,
      type: isVacation ? 'vacation' : 'available',
      ...(isVacation ? { label: 'ODMOR - CRNA GORA', color: '#EF4444' } : {}),
    });
    if (h < 18) {
      slots.push({
        time: `${String(h).padStart(2, '0')}:30`,
        type: isVacation ? 'vacation' : 'available',
        ...(isVacation ? { label: 'ODMOR - CRNA GORA', color: '#EF4444' } : {}),
      });
    }
  }
  return slots;
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; dot: string; text: string }> = {
  scheduled: { label: 'Zakazan', color: '#E11D2E', bg: 'rgba(225,29,45,0.12)', dot: '#E11D2E', text: '#F87171' },
  in_progress: { label: 'U toku', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B', text: '#FBBF24' },
  completed: { label: 'Završen', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', dot: '#22C55E', text: '#4ADE80' },
  cancelled: { label: 'Otkazan', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', dot: '#EF4444', text: '#F87171' },
};
