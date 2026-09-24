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

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns a 6x7 grid (42 cells) covering the month view, starting Monday
export function getMonthGrid(year: number, month: number): { date: Date; isCurrentMonth: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  while (cells.length < 42) {
    const next = cells.length - dayOfWeek - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, next), isCurrentMonth: false });
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
  const dayName = WEEKDAYS_FULL[(today.getDay() + 6) % 7];
  return dayName;
}

export function getTodayLabelColor(): string {
  const today = new Date();
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

export function generateTimeSlots(date: Date): { time: string; type: 'available' | 'booked' | 'break' | 'vacation' }[] {
  const slots: { time: string; type: 'available' | 'booked' | 'break' | 'vacation' }[] = [];
  for (let h = 8; h <= 18; h++) {
    slots.push({ time: `${String(h).padStart(2, '0')}:00`, type: 'available' });
    if (h < 18) slots.push({ time: `${String(h).padStart(2, '0')}:30`, type: 'available' });
  }
  return slots;
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; dot: string; text: string }> = {
  scheduled: { label: 'Zakazan', color: '#E11D2E', bg: 'rgba(225,29,45,0.12)', dot: '#E11D2E', text: '#F87171' },
  in_progress: { label: 'U toku', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', dot: '#F59E0B', text: '#FBBF24' },
  completed: { label: 'Završen', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', dot: '#22C55E', text: '#4ADE80' },
  cancelled: { label: 'Otkazan', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', dot: '#EF4444', text: '#F87171' },
};
