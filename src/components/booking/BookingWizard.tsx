import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Check, X, ChevronLeft, ChevronRight, Calendar as CalIcon, Image as ImageIcon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { MOCK_SERVICES } from '@/data/mockData';
import { Client, Service, Appointment } from '@/types/calendar';
import { MONTHS, WEEKDAYS_FULL } from '@/lib/calendar';
import { capitalizeFirst, capitalizeWords } from '@/lib/text';
import { getHolidayForDate } from '@/lib/churchCalendar';
import * as api from '@/lib/api';

interface BookingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    service: Service;
    date: Date;
    client: Client;
    employeeName: string;
    note: string;
    imageUrl?: string;
    editingId?: string;
  }) => void;
  preselectedDate?: Date;
  existingClients: Client[];
  editAppointment?: Appointment | null;
}

const EMPLOYEES = ['Marko Arsenovic'];
const WEEKDAYS_SHORT_LOCAL = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function BookingWizard({
  open, onClose, onComplete, preselectedDate, existingClients, editAppointment,
}: BookingWizardProps) {
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceDropdown, setServiceDropdown] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(preselectedDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [note, setNote] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      try {
        const rows = await api.fetchServices();
        if (cancelled) return;
        const mapped: Service[] = rows
          .filter((r) => !r.discontinued)
          .map((r) => ({
            id: r.id,
            name: r.name,
            duration: r.duration,
            price: r.price || 0,
            currency: (r.currency || 'RSD') as 'RSD' | 'EUR',
            category: r.category || '',
            discontinued: r.discontinued || false,
          }));
        setServices(mapped.length > 0 ? mapped : MOCK_SERVICES);
      } catch {
        if (!cancelled) setServices(MOCK_SERVICES);
      }
    }
    load();
    const onUpdated = () => { load(); };
    window.addEventListener('services-updated', onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('services-updated', onUpdated);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editAppointment) {
      setSelectedService(
        editAppointment.serviceName
          ? {
              id: editAppointment.serviceId || 'edit-svc',
              name: editAppointment.serviceName,
              duration: editAppointment.duration || 60,
              price: 0,
              currency: 'RSD' as const,
            }
          : null,
      );
      setSelectedDate(new Date(editAppointment.date + 'T00:00'));
      setNewFirst(editAppointment.clientName.split(' ')[0] || '');
      setNewLast(editAppointment.clientName.split(' ').slice(1).join(' ') || '');
      setNameSearch(editAppointment.clientName);
      setNewPhone(editAppointment.clientPhone || '');
      setNewPlate(editAppointment.vehicle?.plate || '');
      setNote(editAppointment.note || '');
      setImagePreview(editAppointment.imageUrl || '');
      setSelectedClient(null);
    } else {
      setServiceSearch(''); setSelectedService(null);
      setSelectedDate(preselectedDate || new Date());
      setNameSearch(''); setSelectedClient(null);
      setNewFirst(''); setNewLast(''); setNewPhone(''); setNewPlate('');
      setNote(''); setImagePreview('');
    }
    setShowDatePicker(false); setServiceDropdown(false);
  }, [open, editAppointment, preselectedDate]);

  useEffect(() => {
    if (!open || !editAppointment) return;
    const matched =
      services.find((s) => s.id === editAppointment.serviceId) ||
      services.find((s) => s.name === editAppointment.serviceName);
    if (matched) setSelectedService(matched);
  }, [open, editAppointment, services]);

  const filteredServices = useMemo(() => {
    const active = services.filter((s) => !s.discontinued);
    if (!serviceSearch.trim()) return active.slice(0, 12);
    const q = serviceSearch.toLowerCase();
    return active.filter((s) =>
      s.name.toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q),
    ).slice(0, 12);
  }, [serviceSearch, services]);

  const exactServiceMatch = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return true;
    return services.some((s) => s.name.toLowerCase() === q);
  }, [serviceSearch, services]);

  const filteredClients = useMemo(() => {
    if (!nameSearch.trim() || nameSearch.length < 2) return [];
    const q = nameSearch.toLowerCase();
    return existingClients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    ).slice(0, 5);
  }, [nameSearch, existingClients]);

  const clientOk = selectedClient || newFirst.trim();

  function handleNameSearchChange(val: string) {
    const cap = capitalizeWords(val);
    setNameSearch(cap);
    setShowSuggestions(cap.length >= 2);
    const parts = cap.split(' ');
    setNewFirst(parts[0] || '');
    setNewLast(parts.slice(1).join(' ') || '');
  }

  function selectExistingClient(c: Client) {
    setSelectedClient(c);
    setNameSearch(c.name);
    setShowSuggestions(false);
    setNewFirst(c.firstName);
    setNewLast(c.lastName);
    setNewPhone(c.phone);
    if (c.vehicles[0]) setNewPlate(c.vehicles[0].plate);
  }

  function pickService(s: Service) {
    setSelectedService(s);
    setServiceSearch('');
    setServiceDropdown(false);
  }

  async function addTypedService() {
    const name = capitalizeFirst(serviceSearch.trim());
    if (!name) return;
    try {
      const created = await api.createService({
        name, category: '', duration: 60, price: 0, currency: 'RSD',
      });
      const svc: Service = {
        id: created.id, name: created.name, duration: created.duration,
        price: created.price || 0, currency: (created.currency || 'RSD') as 'RSD' | 'EUR',
        category: created.category || '',
      };
      setServices((prev) => [...prev, svc]);
      pickService(svc);
    } catch {
      pickService({ id: 'new-svc-' + Date.now(), name, duration: 60, price: 0, currency: 'RSD' });
    }
  }

  function handleComplete() {
    if (!selectedService || !clientOk) return;
    const client: Client = selectedClient || {
      id: 'new-' + Date.now(),
      firstName: newFirst,
      lastName: newLast,
      name: `${newFirst} ${newLast}`.trim(),
      phone: newPhone,
      vehicles: [{ make: '', model: '', plate: newPlate }],
      isActive: true,
    };
    onComplete({
      service: selectedService,
      date: selectedDate,
      client,
      employeeName: EMPLOYEES[0],
      note,
      imageUrl: imagePreview || undefined,
      editingId: editAppointment?.id,
    });
  }

  const dateLabel = `${WEEKDAYS_FULL[(selectedDate.getDay() + 6) % 7]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()].toLowerCase()}`;
  const selectedHoliday = getHolidayForDate(selectedDate);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            const r = new FileReader();
            r.onload = () => setImagePreview(r.result as string);
            r.readAsDataURL(f);
          }
        }}
      />

      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
        <h2 className="text-[17px] font-extrabold text-text-primary tracking-tight">
          {editAppointment ? 'Izmeni termin' : 'Zakaži termin'}
        </h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary p-1 rounded-lg hover:bg-bg-secondary transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* Service search */}
        <div className="relative">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Usluga</label>
          {selectedService ? (
            <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-primary bg-primary-muted">
              <div className="flex items-center gap-2.5 min-w-0">
                <Check size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm font-bold text-primary truncate">{selectedService.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-primary tabular-nums">{selectedService.price} RSD</span>
                <button onClick={() => setSelectedService(null)} className="text-primary/60 hover:text-primary p-0.5"><X size={15} /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  value={serviceSearch}
                  onChange={(e) => { setServiceSearch(e.target.value); setServiceDropdown(true); }}
                  onFocus={() => setServiceDropdown(true)}
                  onBlur={() => setTimeout(() => setServiceDropdown(false), 150)}
                  placeholder="Pretraži uslugu..."
                  className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              {serviceDropdown && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-dropdown max-h-52 overflow-y-auto anim-fade-in">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onMouseDown={(e) => { e.preventDefault(); pickService(service); }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-bg-secondary transition-colors border-b border-border-subtle last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-text-primary truncate block">{service.name}</span>
                        {service.category && (
                          <span className="text-[11px] text-text-tertiary">{service.category}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-text-secondary tabular-nums flex-shrink-0 ml-2">
                        {service.price > 0 ? `${service.price} ${service.currency || 'RSD'}` : '—'}
                      </span>
                    </button>
                  ))}
                  {serviceSearch.trim() && !exactServiceMatch && (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); addTypedService(); }}
                      className="w-full px-3.5 py-2.5 text-left text-sm font-semibold text-primary hover:bg-bg-secondary"
                    >
                      + Dodaj uslugu „{capitalizeFirst(serviceSearch.trim())}“
                    </button>
                  )}
                  {filteredServices.length === 0 && !serviceSearch.trim() && (
                    <p className="px-3.5 py-3 text-[12px] text-text-tertiary">
                      Nema usluga. Dodaj ih u Firma → Usluge.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Datum</label>
          {selectedHoliday && (
            <div className="mb-2 flex items-start gap-2 rounded-xl px-3 py-2 border border-amber-400/35 bg-amber-400/15">
              <span className="text-amber-300 text-sm leading-none mt-0.5">★</span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-amber-200">
                  {selectedHoliday.kind === 'national' ? 'Državni praznik' : 'Praznik'}: {selectedHoliday.name}
                </p>
                {selectedHoliday.note && (
                  <p className="text-[11px] text-amber-100/70 mt-0.5">{selectedHoliday.note}</p>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border hover:bg-hover transition-colors ${
              selectedHoliday ? 'border-amber-400/40 bg-amber-400/10' : 'border-border bg-bg-secondary'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalIcon size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary capitalize">{dateLabel}</span>
            </div>
            <ChevronRight size={15} className={`text-text-tertiary transition-transform ${showDatePicker ? 'rotate-90' : ''}`} />
          </button>

          {showDatePicker && (
            <div className="overflow-hidden anim-grow pt-2">
              <MiniMonthGrid selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setShowDatePicker(false); }} />
            </div>
          )}
        </div>

        {/* Client */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Klijent</label>
          <div className="relative">
            <input
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(nameSearch.length >= 2)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Ime i prezime (npr. Marko Petrović)"
              className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            />
            {showSuggestions && filteredClients.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-dropdown max-h-44 overflow-y-auto anim-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary border-b border-border-subtle">
                  Postojeći klijenti
                </div>
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={(e) => { e.preventDefault(); selectExistingClient(c); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-bg-secondary"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">{c.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate">{c.name}</p>
                      <p className="text-[11px] text-text-tertiary">{c.phone}{c.vehicles[0]?.plate ? ` · ${c.vehicles[0].plate}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <input value={newFirst} onChange={(e) => setNewFirst(capitalizeWords(e.target.value))} placeholder="Ime"
              className="bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors" />
            <input value={newLast} onChange={(e) => setNewLast(capitalizeWords(e.target.value))} placeholder="Prezime"
              className="bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          <div className="flex items-stretch gap-2 mt-2">
            <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-xl px-2.5 py-2.5 text-sm font-semibold text-text-primary flex-shrink-0">
              <span className="text-[11px]">🇷🇸</span>
              <span className="text-[12px]">+381</span>
            </div>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Telefon (opciono)"
              className="flex-1 min-w-0 bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          <input value={newPlate} onChange={(e) => setNewPlate(e.target.value.toUpperCase())} placeholder="Registracija (npr. BG-123-AB)"
            className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors mt-2 uppercase" />
        </div>

        {/* Note + image inline */}
        <div className="flex gap-2">
          <input value={note} onChange={(e) => setNote(capitalizeFirst(e.target.value))} placeholder="Napomena (opciono)"
            className="flex-1 min-w-0 bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors" />
          {imagePreview ? (
            <div className="relative flex-shrink-0">
              <img src={imagePreview} alt="" className="w-11 h-11 object-cover rounded-xl border border-border" />
              <button onClick={() => setImagePreview('')} className="absolute -top-1 -right-1 p-0.5 rounded-full bg-danger text-white"><X size={11} /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="flex-shrink-0 w-11 h-11 rounded-xl border border-dashed border-border text-text-tertiary hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center">
              <ImageIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-t border-border-subtle bg-bg-card flex-shrink-0">
        <button onClick={onClose} className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
          Otkaži
        </button>
        <div className="text-[13px] font-bold text-text-primary">
          {selectedService ? `${selectedService.price} RSD` : ''}
        </div>
        <button
          onClick={handleComplete}
          disabled={!selectedService || !clientOk}
          className="press py-2.5 px-6 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover hover:shadow-btn-hover transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {editAppointment ? 'Sačuvaj izmene' : 'Sačuvaj'}
        </button>
      </div>
    </Modal>
  );
}

function MiniMonthGrid({ selectedDate, onSelect }: { selectedDate: Date; onSelect: (d: Date) => void }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { date: Date; current: boolean }[] = [];
  for (let i = dayOfWeek - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true });
  }
  while (cells.length % 7 !== 0) {
    const next = cells.length - dayOfWeek - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, next), current: false });
  }

  const today = new Date();
  const selStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-2.5">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onSelect(new Date(year, month - 1, 1))} className="p-1 rounded-lg text-text-secondary hover:bg-bg-card transition-colors"><ChevronLeft size={15} /></button>
        <span className="text-sm font-bold text-text-primary capitalize">{MONTHS[month].toLowerCase()} {year}</span>
        <button onClick={() => onSelect(new Date(year, month + 1, 1))} className="p-1 rounded-lg text-text-secondary hover:bg-bg-card transition-colors"><ChevronRight size={15} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAYS_SHORT_LOCAL.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase text-text-tertiary py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const cellStr = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isSel = cellStr === selStr;
          const isToday = isSameDay(cell.date, today);
          const holiday = getHolidayForDate(cell.date);
          return (
            <button
              key={i}
              title={holiday ? holiday.name : undefined}
              onClick={() => onSelect(cell.date)}
              className={`aspect-square rounded-lg text-[12px] font-semibold transition-all ${
                isSel
                  ? 'bg-primary text-white'
                  : holiday
                    ? 'bg-amber-400/35 text-amber-100 hover:bg-amber-400/50'
                    : cell.current
                      ? (isToday ? 'bg-primary-muted text-primary' : 'text-text-primary hover:bg-bg-card')
                      : 'text-text-tertiary hover:bg-bg-card/50'
              }`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
