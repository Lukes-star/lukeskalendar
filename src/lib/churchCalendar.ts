// Srpski pravoslavni crkveni kalendar
// Nepokretni praznici po julijanskom kalendaru + pokretni (Uskrs/Vaskrs)
// Reference: https://www.spc.rs/

export interface ChurchHoliday {
  name: string;
  type: 'fixed' | 'easter-relative';
  month: number; // 1-12
  day: number; // 1-31
  // For easter-relative: offset in days from Easter Sunday (0 = Easter)
  easterOffset?: number;
  importance: 'major' | 'minor';
  fasting?: boolean;
  note?: string;
  kind?: 'church' | 'national';
}

// Fixed-date holidays (Julian calendar, +13 days for Gregorian)
// We store the GREGORIAN date directly for simplicity.
export const FIXED_HOLIDAYS: ChurchHoliday[] = [
  { name: 'Božić', type: 'fixed', month: 1, day: 7, importance: 'major', note: 'Rođenje Gospoda Isusa Hrista' },
  { name: 'Bogojavljanje', type: 'fixed', month: 1, day: 19, importance: 'major', note: 'Krštenje Gospodnje' },
  { name: 'Sveti Sava', type: 'fixed', month: 1, day: 27, importance: 'major', note: 'Sveti Sava, prosvetitelj srpski' },
  { name: 'Sretenje', type: 'fixed', month: 2, day: 15, importance: 'major', note: 'Sretenje Gospodnje, državnost Srbije' },
  { name: 'Đurđevdan', type: 'fixed', month: 5, day: 6, importance: 'major', note: 'Sveti Georgije, jurjevdanski poklad' },
  { name: 'Vidovdan', type: 'fixed', month: 6, day: 28, importance: 'major', note: 'Sveti car Lazar i sveti mučenici' },
  { name: 'Preobraženje', type: 'fixed', month: 8, day: 19, importance: 'major' },
  { name: 'Velika Gospojina', type: 'fixed', month: 8, day: 28, importance: 'major', note: 'Uspenje presvete Bogorodice' },
  { name: 'Usekovanje', type: 'fixed', month: 9, day: 11, importance: 'minor' },
  { name: 'Krstovdan', type: 'fixed', month: 9, day: 27, importance: 'minor' },
  { name: 'Mitrovdan', type: 'fixed', month: 11, day: 8, importance: 'major' },
  { name: 'Sveti Nikola', type: 'fixed', month: 12, day: 19, importance: 'major', note: 'Sveti Nikola, hranitelj i zaštitnik' },
  { name: 'Badnji dan', type: 'fixed', month: 1, day: 6, importance: 'major', fasting: true },
  { name: 'Sveti Vasilije Ostroški', type: 'fixed', month: 5, day: 12, importance: 'minor' },
  { name: 'Sveta Petka', type: 'fixed', month: 10, day: 27, importance: 'minor' },
  { name: 'Nova godina', type: 'fixed', month: 1, day: 1, importance: 'major', kind: 'national', note: 'Državni praznik' },
  { name: 'Nova godina', type: 'fixed', month: 1, day: 2, importance: 'major', kind: 'national', note: 'Državni praznik' },
  { name: 'Praznik rada', type: 'fixed', month: 5, day: 1, importance: 'major', kind: 'national', note: 'Državni praznik' },
  { name: 'Praznik rada', type: 'fixed', month: 5, day: 2, importance: 'major', kind: 'national', note: 'Državni praznik' },
  { name: 'Dan primirja', type: 'fixed', month: 11, day: 11, importance: 'major', kind: 'national', note: 'Dan primirja u Prvom svetskom ratu' },
];

// Easter-relative holidays (offset in days from Easter Sunday)
export const EASTER_RELATIVE_HOLIDAYS: ChurchHoliday[] = [
  { name: 'Vaskrs', type: 'easter-relative', month: 0, day: 0, easterOffset: 0, importance: 'major', note: 'Vaskrsenje Hristovo' },
  { name: 'Vaskrsni ponedeljak', type: 'easter-relative', month: 0, day: 0, easterOffset: 1, importance: 'major', kind: 'national', note: 'Državni praznik' },
  { name: 'Radonice', type: 'easter-relative', month: 0, day: 0, easterOffset: 9, importance: 'minor', note: 'Pomen mrtvima' },
  { name: 'Vaznesenje - Spasovdan', type: 'easter-relative', month: 0, day: 0, easterOffset: 39, importance: 'major' },
  { name: 'Duhovi', type: 'easter-relative', month: 0, day: 0, easterOffset: 49, importance: 'major' },
  { name: 'Petrovdan', type: 'easter-relative', month: 0, day: 0, easterOffset: 57, importance: 'minor' },
  { name: 'Veliki petak', type: 'easter-relative', month: 0, day: 0, easterOffset: -2, importance: 'major', fasting: true, note: 'Pashalna žrtva' },
  { name: 'Velika subota', type: 'easter-relative', month: 0, day: 0, easterOffset: -1, importance: 'major', fasting: true },
  { name: 'Lazareva subota', type: 'easter-relative', month: 0, day: 0, easterOffset: -8, importance: 'minor' },
  { name: 'Cveti', type: 'easter-relative', month: 0, day: 0, easterOffset: -7, importance: 'minor' },
  { name: 'Čist ponedeljak', type: 'easter-relative', month: 0, day: 0, easterOffset: -48, importance: 'minor', fasting: true, note: 'Početak Uskršnjeg posta' },
];

// Meeus/Jones/Butcher Orthodox Easter algorithm (Gregorian date)
// Returns Easter Sunday as a Date for the given year
export function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April
  const day = ((d + e + 114) % 31) + 1;
  // Julian calendar date — add 13 days for Gregorian (21st century)
  const julian = new Date(year, month - 1, day);
  const gregorian = new Date(year, month - 1, day + 13);
  return gregorian;
}

export interface ResolvedHoliday extends ChurchHoliday {
  date: Date;
  iso: string;
}

// Resolve all holidays for a given year (fixed + easter-relative)
export function getHolidaysForYear(year: number): ResolvedHoliday[] {
  const easter = orthodoxEaster(year);
  const resolved: ResolvedHoliday[] = [];

  for (const h of FIXED_HOLIDAYS) {
    const date = new Date(year, h.month - 1, h.day);
    resolved.push({ ...h, date, iso: dateToISOLocal(date) });
  }

  for (const h of EASTER_RELATIVE_HOLIDAYS) {
    if (h.easterOffset === undefined) continue;
    const date = new Date(easter);
    date.setDate(easter.getDate() + h.easterOffset);
    resolved.push({ ...h, date, iso: dateToISOLocal(date) });
  }

  return resolved.sort((a, b) => a.iso.localeCompare(b.iso));
}

// Get holiday(s) for a specific date (checks current + adjacent year for safety)
export function getHolidayForDate(date: Date): ResolvedHoliday | null {
  const iso = dateToISOLocal(date);
  const year = date.getFullYear();
  const holidays = [...getHolidaysForYear(year), ...getHolidaysForYear(year - 1), ...getHolidaysForYear(year + 1)];
  return holidays.find((h) => h.iso === iso) || null;
}

function dateToISOLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
