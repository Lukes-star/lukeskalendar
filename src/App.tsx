import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Menu, X, AlertTriangle, Bell, Clock, Search, UserCircle } from 'lucide-react';
import { Sidebar, NavSection } from '@/components/layout/Sidebar';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AddNoteModal } from '@/components/calendar/AddNoteModal';
import { KlijentiList } from '@/components/clients/KlijentiList';
import { KlijentDetalji } from '@/components/clients/KlijentDetalji';
import { ClientEditModal } from '@/components/clients/ClientEditModal';
import { FirmaSettings } from '@/components/firma/FirmaSettings';
import { TerminiList } from '@/components/appointments/TerminiList';
import { Notifikacije } from '@/components/notifikacije/Notifikacije';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { startAlarmLoop, stopAlarmSound } from '@/lib/alarm';
import { Appointment, AppointmentStatus, CalendarView, Client, Service } from '@/types/calendar';
import { dateToISO } from '@/lib/calendar';
import * as api from '@/lib/api';
import type { ClientRow, AppointmentRow, NoteRow as DbNoteRow } from '@/lib/db';

type Page = 'dashboard' | 'kalendar' | 'klijenti' | 'klijent-detalji' | 'firma' | 'termini' | 'notifikacije';

interface NoteRow {
  id: string;
  content: string;
  date: string;
  reminder_time: string;
  is_triggered: boolean;
}

function mapAptFromDb(row: AppointmentRow): Appointment {
  return {
    id: row.id, clientId: row.client_id || '', clientName: row.client_name || '',
    clientPhone: row.client_phone || '',
    vehicle: (row.vehicle as any) || { make: '', model: '', plate: '' },
    serviceId: row.service_id || '', serviceName: row.service_name || '',
    duration: row.duration || 0,
    date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0],
    startTime: row.start_time || undefined, endTime: row.end_time || undefined,
    note: row.note || undefined, status: (row.status || 'scheduled') as AppointmentStatus,
    employeeId: row.employee_id || undefined, employeeName: row.employee_name || undefined,
    imageUrl: row.image_url || undefined,
  };
}

function mapClientFromDb(row: ClientRow): Client {
  return {
    id: row.id, firstName: row.first_name || '', lastName: row.last_name || '',
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.phone,
    phone: row.phone, email: row.email || undefined, address: row.address || undefined,
    birthDate: row.birth_date || undefined, gender: (row.gender as any) || undefined,
    currency: (row.currency as any) || 'RSD', isActive: row.is_active ?? true,
    note: (row as any).note || undefined,
    noShow: row.no_show || 0, blocked: row.blocked || false,
    vehicles: (row.vehicles as any) || [],
    createdAt: row.created_at?.split('T')[0],
    totalAppointments: 0, totalEarnings: 0,
  };
}

function mapNoteFromDb(row: DbNoteRow): NoteRow {
  return {
    id: row.id, content: row.content,
    date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0],
    reminder_time: row.reminder_time,
    is_triggered: row.is_triggered,
  };
}

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [page, setPage] = useState<Page>('dashboard');
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDate, setWizardDate] = useState<Date | undefined>();
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [clientEditOpen, setClientEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [alarmActive, setAlarmActive] = useState<NoteRow | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const triggeredIds = useRef<Set<string>>(new Set());
  const dismissedIds = useRef<Set<string>>(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    void loadData();
    const refreshTimer = window.setInterval(() => { void loadData(false); }, 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const [aptRows, clientRows, noteRows] = await Promise.all([
        api.fetchAppointments(),
        api.fetchClients(),
        api.fetchNotes(),
      ]);
      const mappedAppointments = aptRows.map(mapAptFromDb);
      const mappedClients = clientRows.map(mapClientFromDb).map((client) => ({
        ...client,
        totalAppointments: mappedAppointments.filter((appointment) => appointment.clientId === client.id).length,
      }));
      setAppointments(mappedAppointments);
      setClients(mappedClients);
      setNotes(noteRows.map(mapNoteFromDb));
    } catch (err: any) {
      console.error('loadData error:', err);
      if (showLoading) setSaveError('Greška pri učitavanju: ' + (err?.message || 'nepoznata greška'));
    }
    if (showLoading) setLoading(false);
  }

  useEffect(() => {
    const interval = setInterval(() => checkAlarms(), 30000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [notes]);

  function checkAlarms() {
    const now = new Date();
    const todayStr = dateToISO(now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    for (const note of notes) {
      if (note.is_triggered || triggeredIds.current.has(note.id) || dismissedIds.current.has(note.id)) continue;
      if (note.date === todayStr && note.reminder_time <= currentTime) {
        triggeredIds.current.add(note.id);
        setAlarmActive(note);
        startAlarmLoop();
        api.updateNoteTriggered(note.id, true);
        setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_triggered: true } : n)));
      }
    }
  }

  function dismissAlarm() {
    if (alarmActive) {
      dismissedIds.current.add(alarmActive.id);
      triggeredIds.current.add(alarmActive.id);
      api.updateNoteTriggered(alarmActive.id, true);
      setNotes((prev) => prev.map((n) => (n.id === alarmActive.id ? { ...n, is_triggered: true } : n)));
    }
    setAlarmActive(null); stopAlarmSound();
  }

  function calcLateMin(note: NoteRow): number {
    const now = new Date();
    const [h, m] = note.reminder_time.split(':').map(Number);
    const ref = new Date(note.date + 'T00:00');
    ref.setHours(h, m, 0, 0);
    return Math.max(0, Math.round((now.getTime() - ref.getTime()) / 60000));
  }

  const goPrev = useCallback(() => {
    if (view === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (view === 'week') setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
    else if (view === 'day') setCurrentDate(new Date(year, month, currentDate.getDate() - 1));
    else setCurrentDate(new Date(year - 1, month, 1));
  }, [view, year, month, currentDate]);

  const goNext = useCallback(() => {
    if (view === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (view === 'week') setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
    else if (view === 'day') setCurrentDate(new Date(year, month, currentDate.getDate() + 1));
    else setCurrentDate(new Date(year + 1, month, 1));
  }, [view, year, month, currentDate]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleAppointmentClick = useCallback((apt: Appointment) => {
    setSelectedAppt(apt); setDrawerOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setWizardDate(date); setWizardOpen(true);
  }, []);

  const handleWizardComplete = useCallback(async ({
    service, date, client, employeeName, note, imageUrl, editingId,
  }: {
    service: Service; date: Date; client: Client; employeeName: string; note: string; imageUrl?: string; editingId?: string;
  }) => {
    setSaveError(null); setSaveSuccess(null);
    try {
      let clientId = client.id;
      if (client.id.startsWith('new-')) {
        const newClient = await api.createClient({
          first_name: client.firstName, last_name: client.lastName, phone: client.phone,
          vehicles: client.vehicles, is_active: true, currency: 'RSD',
        });
        clientId = newClient.id;
        setClients((prev) => [mapClientFromDb(newClient), ...prev]);
      }
      if (editingId) {
        const updated = await api.updateAppointment(editingId, {
          client_id: clientId, client_name: client.name, client_phone: client.phone,
          vehicle: client.vehicles[0] || { make: '', model: '', plate: '' },
          service_id: service.id, service_name: service.name, duration: service.duration,
          date: dateToISO(date), note: note || null,
          employee_name: employeeName, image_url: imageUrl || null,
        });
        setAppointments((prev) => prev.map((a) => (a.id === editingId ? mapAptFromDb(updated) : a)));
        setSaveSuccess('Termin je izmenjen.');
      } else {
        const newApt = await api.createAppointment({
          client_id: clientId, client_name: client.name, client_phone: client.phone,
          vehicle: client.vehicles[0] || { make: '', model: '', plate: '' },
          service_id: service.id, service_name: service.name, duration: service.duration,
          date: dateToISO(date), note: note || null,
          employee_name: employeeName, image_url: imageUrl || null,
          status: 'scheduled',
        });
        setAppointments((prev) => [...prev, mapAptFromDb(newApt)]);
        setClients((prev) => prev.map((item) => item.id === clientId
          ? { ...item, totalAppointments: (item.totalAppointments || 0) + 1 }
          : item));
        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
        setSaveSuccess('Termin je zakazan.');
      }
      setWizardOpen(false); setEditingAppt(null);
    } catch (err: any) {
      setSaveError('Greška pri čuvanju termina: ' + (err?.message || 'nepoznata greška'));
    }
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelectedAppt((prev) => (prev?.id === id ? { ...prev, status } : prev));
    try {
      await api.updateAppointmentStatus(id, status);
    } catch {
      setSaveError('Greška pri promeni statusa.');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setDrawerOpen(false);
    try {
      await api.deleteAppointment(id);
    } catch {
      setSaveError('Greška pri brisanju termina.');
    }
  }, []);

  const handleEditAppointment = useCallback((apt: Appointment) => {
    setSelectedAppt(apt); setEditingAppt(apt);
    setWizardDate(new Date(apt.date + 'T00:00'));
    setDrawerOpen(false); setWizardOpen(true);
  }, []);

  const openNewAppointment = useCallback(() => {
    setSelectedAppt(null); setEditingAppt(null); setWizardDate(undefined); setWizardOpen(true);
  }, []);

  const handleNavSelect = useCallback((section: NavSection) => {
    setActiveSection(section);
    if (section === 'dashboard') setPage('dashboard');
    else if (section === 'kalendar') setPage('kalendar');
    else if (section === 'klijenti') setPage('klijenti');
    else if (section === 'firma') setPage('firma');
    else if (section === 'termini') setPage('termini');
    else if (section === 'opste') setPage('notifikacije');
  }, []);

  const handleClientClick = useCallback((client: Client) => {
    setSelectedClient(client); setPage('klijent-detalji');
  }, []);

  const handleClientSave = useCallback(async (client: Client) => {
    setSaveError(null); setSaveSuccess(null);
    try {
      const dbData = {
        first_name: client.firstName, last_name: client.lastName, phone: client.phone,
        email: client.email || null, address: client.address || null,
        note: (client as any).note || null,
        birth_date: client.birthDate || null, gender: client.gender || null,
        currency: client.currency || 'RSD',
        is_active: client.isActive ?? true, vehicles: client.vehicles,
      };
      if (client.id.startsWith('new-') || !clients.find((c) => c.id === client.id)) {
        const created = await api.createClient(dbData);
        setClients((prev) => [mapClientFromDb(created), ...prev]);
        setSelectedClient(mapClientFromDb(created));
        setSaveSuccess('Klijent je sačuvan.');
      } else {
        const updated = await api.updateClient(client.id, dbData);
        setClients((prev) => prev.map((c) => (c.id === client.id ? mapClientFromDb(updated) : c)));
        setSelectedClient(mapClientFromDb(updated));
        setSaveSuccess('Klijent je izmenjen.');
      }
      setClientEditOpen(false);
    } catch (err: any) {
      setSaveError('Greška pri čuvanju klijenta: ' + (err?.message || 'nepoznata greška'));
    }
  }, [clients]);

  const handleDeleteClient = useCallback(async (id: string) => {
    setSaveError(null); setSaveSuccess(null);
    try {
      await api.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setSaveSuccess('Klijent je obrisan.');
      setPage('klijenti');
    } catch (err: any) {
      setSaveError('Greška pri brisanju klijenta: ' + (err?.message || 'nepoznata greška'));
    }
  }, []);

  const handleToggleActive = useCallback(async (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    const newVal = !client.isActive;
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: newVal } : c)));
    setSelectedClient((prev) => (prev?.id === id ? { ...prev, isActive: newVal } : prev));
    try {
      await api.updateClientActive(id, newVal);
    } catch {
      setSaveError('Greška pri promeni statusa klijenta.');
    }
  }, [clients]);

  const openEditClient = useCallback((client: Client | null) => { setEditingClient(client); setClientEditOpen(true); }, []);
  const openAddClient = useCallback(() => { setEditingClient(null); setClientEditOpen(true); }, []);

  const handleSaveNote = useCallback(async (note: { content: string; date: string; reminder_time: string }) => {
    setSaveError(null); setSaveSuccess(null);
    try {
      const created = await api.createNote(note);
      setNotes((prev) => [...prev, mapNoteFromDb(created)]);
      setNoteModalOpen(false);
      setSaveSuccess('Podsetnik je sačuvan.');
    } catch (err: any) {
      setSaveError('Greška pri čuvanju podsetnika: ' + (err?.message || 'nepoznata greška'));
    }
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      const t = setTimeout(() => setSaveSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [saveSuccess]);

  const pageTitle = page === 'dashboard' ? 'Kontrolna tabla' : page === 'kalendar' ? 'Kalendar' : page === 'klijenti' ? 'Klijenti' : page === 'firma' ? 'Firma' : page === 'termini' ? 'Termini' : page === 'notifikacije' ? 'Notifikacije' : 'Klijent';

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base selection:bg-primary/15 selection:text-primary">
      <Sidebar active={activeSection} onSelect={handleNavSelect} />

      {mobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={() => setMobileSidebar(false)} />
          <div className="absolute left-0 top-0 h-full anim-slide-in-left">
            <div className="relative h-full">
              <Sidebar mobile active={activeSection} onSelect={(s) => { handleNavSelect(s); setMobileSidebar(false); }} />
              <button onClick={() => setMobileSidebar(false)} className="absolute top-5 right-5 text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="hidden md:flex h-12 items-center justify-between px-5 border-b border-border-subtle bg-bg-card/90">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[15px] font-extrabold tracking-tight text-text-primary">Čaki Admin</span>
            <span className="h-4 w-px bg-border" />
            <span className="text-[12px] text-text-tertiary truncate">Čaki Servis Farova</span>
          </div>
          <div className="flex items-center gap-3 text-text-tertiary">
            <button
              onClick={() => handleNavSelect('termini')}
              className="hidden lg:flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary px-3 py-1.5 text-[12px] hover:border-primary/40 hover:text-text-primary transition-colors"
            >
              <Search size={13} />
              <span>Pretraga termina</span>
              <kbd className="rounded border border-border px-1 text-[10px]">Ctrl K</kbd>
            </button>
            <UserCircle size={20} />
          </div>
        </div>
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-card/95 backdrop-blur-sm">
          <button onClick={() => setMobileSidebar(true)} className="p-2.5 rounded-xl bg-bg-secondary text-text-secondary hover:text-primary transition-colors" aria-label="Otvori meni">
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary/15 shadow-btn ring-2 ring-primary/10">
              <img src="/logo.png" alt="Kalendar" className="w-full h-full object-cover" />
            </div>
            <span className="text-[13px] font-extrabold text-text-primary tracking-tight">{pageTitle}</span>
          </div>
          <div className="w-10" />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div key={page} className="flex-1 flex flex-col min-h-0 anim-fade-in">
            {page === 'dashboard' && (
              <Dashboard
                appointments={appointments}
                clients={clients}
                onOpenCalendar={() => handleNavSelect('kalendar')}
                onOpenClients={() => handleNavSelect('klijenti')}
                onOpenAppointments={() => handleNavSelect('termini')}
                onNewAppointment={openNewAppointment}
              />
            )}
            {page === 'kalendar' && (
              <>
                <CalendarHeader
                  year={year} month={month} view={view}
                  onPrev={goPrev} onNext={goNext} onToday={goToday} onRefresh={loadData}
                  onViewChange={setView}
                />
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  <MonthView
                    year={year} month={month} appointments={appointments}
                    notes={notes}
                    onAppointmentClick={handleAppointmentClick} onDayClick={handleDayClick}
                    onMonthSwipe={(direction) => direction === 'prev' ? goPrev() : goNext()}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 px-4 sm:px-6 py-3 border-t border-border-subtle bg-bg-card">
                  <button
                    onClick={openNewAppointment}
                    className="press flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex-1 sm:flex-none"
                  >
                    <Plus size={17} />
                    Zakaži termin
                  </button>
                  <button
                    onClick={() => setNoteModalOpen(true)}
                    className="press flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-warning text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex-1 sm:flex-none"
                    style={{ backgroundColor: 'var(--warning, #f59e0b)' }}
                  >
                    <Bell size={17} />
                    Podsetnik
                  </button>
                </div>
              </>
            )}

            {page === 'klijenti' && (
              <KlijentiList clients={clients} onClientClick={handleClientClick} onAddClient={openAddClient} />
            )}

            {page === 'klijent-detalji' && selectedClient && (
              <KlijentDetalji
                client={selectedClient} appointments={appointments}
                onBack={() => setPage('klijenti')} onEdit={() => openEditClient(selectedClient)}
                onToggleActive={handleToggleActive} onAppointmentClick={handleAppointmentClick}
                onAddVehicle={() => openEditClient(selectedClient)}
                onDelete={handleDeleteClient}
                onSaveNote={(client) => { void handleClientSave(client); }}
              />
            )}

            {page === 'firma' && <FirmaSettings />}

            {page === 'notifikacije' && <Notifikacije appointments={appointments} />}

            {page === 'termini' && (
              <TerminiList appointments={appointments} onAppointmentClick={handleAppointmentClick} onRefresh={loadData} />
            )}
          </div>
        )}

        {(page === 'dashboard' || page === 'kalendar' || page === 'termini') && !loading && (
          <button
            onClick={openNewAppointment}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-modal z-30 press"
          >
            <Plus size={24} />
          </button>
        )}
      </main>

      {alarmActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(220,38,38,0.45) 0%, rgba(120,10,10,0.65) 100%)',
              backdropFilter: 'blur(8px)',
              animation: 'pulse-red 1.2s ease-in-out infinite',
            }}
          />
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl anim-scale-in"
            style={{
              background: 'linear-gradient(160deg, #1a0606 0%, #2a0a0a 50%, #1a0606 100%)',
              border: '1px solid rgba(239,68,68,0.4)',
              boxShadow: '0 0 60px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-danger/30" style={{ animation: 'alarm-ring 2s ease-out infinite' }} />
              <div className="absolute inset-0 rounded-full border-2 border-danger/20" style={{ animation: 'alarm-ring 2s ease-out infinite 0.5s' }} />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.35) 0%, rgba(239,68,68,0.1) 100%)',
                  animation: 'pulse-red 1s ease-in-out infinite',
                }}
              >
                <AlertTriangle size={40} className="text-red-400" style={{ animation: 'shake-x 0.6s ease-in-out infinite' }} />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Podsetnik</h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-400/60 to-transparent mx-auto mb-4" />

            <p className="text-base text-red-50 font-medium mb-3 leading-relaxed">{alarmActive.content}</p>

            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock size={14} className="text-red-300/70" />
              <span className="text-[13px] text-red-200/80">{alarmActive.reminder_time}</span>
            </div>
            {calcLateMin(alarmActive) > 0 && (
              <p className="text-[12px] font-bold text-red-300 mb-6">Kasnio {calcLateMin(alarmActive)} min</p>
            )}
            {calcLateMin(alarmActive) === 0 && <div className="mb-6" />}

            <button
              onClick={dismissAlarm}
              className="w-full py-3.5 rounded-2xl text-white font-bold transition-all active:scale-[0.97] press"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}
            >
              U redu
            </button>
          </div>
        </div>
      )}

      <BookingWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditingAppt(null); }}
        onComplete={handleWizardComplete}
        preselectedDate={wizardDate}
        existingClients={clients}
        editAppointment={editingAppt}
      />
      <AppointmentDetails
        open={drawerOpen}
        appointment={selectedAppt}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={handleEditAppointment}
      />
      <ClientEditModal
        open={clientEditOpen}
        onClose={() => setClientEditOpen(false)}
        onSave={handleClientSave}
        client={editingClient}
      />
      <AddNoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveNote}
        preselectedDate={currentDate}
      />

      {saveSuccess && (
        <div className="fixed top-4 right-4 z-[120] max-w-md w-[calc(100%-2rem)] sm:w-full anim-slide-up">
          <div role="status" className="bg-success-muted border border-success/30 rounded-xl p-4 flex items-center gap-2.5 shadow-modal">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-sm font-semibold text-success flex-1">{saveSuccess}</p>
            <button onClick={() => setSaveSuccess(null)} className="text-success/60 hover:text-success p-0.5">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="fixed top-4 right-4 z-[120] max-w-md w-[calc(100%-2rem)] sm:w-full anim-slide-up">
          <div className="bg-danger-muted border border-danger/30 rounded-xl p-4 flex items-start gap-2.5 shadow-modal">
            <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-danger">Greška</p>
              <p className="text-[13px] text-text-secondary mt-1">{saveError}</p>
            </div>
            <button onClick={() => setSaveError(null)} className="text-danger/60 hover:text-danger p-0.5">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
