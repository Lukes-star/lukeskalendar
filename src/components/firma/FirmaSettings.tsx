import { useState, useEffect } from 'react';
import {
  Building2, Clock, Wrench, Bell, Plus, Check, ChevronDown,
  Trash2, GripVertical, Calendar, MessageCircle, X, Search,
} from 'lucide-react';
import { MOCK_WORKING_HOURS } from '@/data/mockData';
import { WorkingHours, Service } from '@/types/calendar';
import { formatDuration } from '@/lib/calendar';
import { capitalizeFirst } from '@/lib/text';
import * as api from '@/lib/api';

type Tab = 'radno-vreme' | 'usluge' | 'notifikacije';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'radno-vreme', label: 'Radno vreme', icon: <Clock size={16} /> },
  { id: 'usluge', label: 'Usluge', icon: <Wrench size={16} /> },
  { id: 'notifikacije', label: 'Notifikacije', icon: <Bell size={16} /> },
];

const DAYS = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];

export function FirmaSettings() {
  const [tab, setTab] = useState<Tab>('radno-vreme');
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(MOCK_WORKING_HOURS);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', category: '', duration: 60, price: 0, currency: 'RSD' });

  const filteredServices = services.filter((service) => {
    const query = serviceSearch.trim().toLowerCase();
    return !query || service.name.toLowerCase().includes(query) || (service.category || '').toLowerCase().includes(query);
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const rows = await api.fetchServices();
      if (rows.length > 0) {
        setServices(rows.map((r) => ({
          id: r.id,
          name: r.name,
          duration: r.duration,
          price: r.price || 0,
          currency: (r.currency || 'RSD') as 'RSD' | 'EUR',
          category: r.category || '',
          discontinued: r.discontinued || false,
        })));
      } else {
        // Seed default services on first run
        const defaults = [
          { name: 'Reparacija Fara Zamena Stakla', duration: 240, category: 'Reparacija' },
          { name: 'Poliranje Farova', duration: 150, category: 'Poliranje' },
          { name: 'Masinsko Poliranje Farova', duration: 300, category: 'Poliranje' },
          { name: 'Ugradnja Led Sijalica', duration: 210, category: 'Ugradnja' },
          { name: 'Zamena Modula', duration: 180, category: 'Zamena' },
          { name: 'Zamena DRL Modula', duration: 270, category: 'Zamena' },
          { name: 'Ispitivanje Fara', duration: 120, category: 'Dijagnostika' },
          { name: 'Resavanje Dnevno Svetlo', duration: 270, category: 'Reparacija' },
        ];
        const created = await Promise.all(
          defaults.map((d) => api.createService({
            name: d.name, category: d.category, duration: d.duration, price: 0, currency: 'RSD',
          }))
        );
        setServices(created.map((r) => ({
          id: r.id, name: r.name, duration: r.duration, price: 0, currency: 'RSD' as 'RSD' | 'EUR', category: r.category, discontinued: false,
        })));
      }
    } catch {
      setServices([
        { id: 's1', name: 'Reparacija Fara Zamena Stakla', duration: 240, price: 0, currency: 'RSD', category: 'Reparacija' },
        { id: 's2', name: 'Poliranje Farova', duration: 150, price: 0, currency: 'RSD', category: 'Poliranje' },
        { id: 's3', name: 'Masinsko Poliranje Farova', duration: 300, price: 0, currency: 'RSD', category: 'Poliranje' },
        { id: 's4', name: 'Ugradnja Led Sijalica', duration: 210, price: 0, currency: 'RSD', category: 'Ugradnja' },
        { id: 's5', name: 'Zamena Modula', duration: 180, price: 0, currency: 'RSD', category: 'Zamena' },
        { id: 's6', name: 'Zamena DRL Modula', duration: 270, price: 0, currency: 'RSD', category: 'Zamena' },
        { id: 's7', name: 'Ispitivanje Fara', duration: 120, price: 0, currency: 'RSD', category: 'Dijagnostika' },
        { id: 's8', name: 'Resavanje Dnevno Svetlo', duration: 270, price: 0, currency: 'RSD', category: 'Reparacija' },
      ]);
    }
  }

  async function saveService() {
    if (!serviceForm.name.trim()) return;
    const payload = {
      name: capitalizeFirst(serviceForm.name),
      category: capitalizeFirst(serviceForm.category),
      duration: serviceForm.duration,
      price: serviceForm.price,
      currency: serviceForm.currency,
    };
    try {
      if (editingService) {
        const updated = await api.updateService(editingService.id, payload);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? {
          ...s, name: updated.name, category: updated.category, duration: updated.duration,
          price: updated.price, currency: (updated.currency || 'RSD') as 'RSD' | 'EUR',
        } : s)));
      } else {
        const created = await api.createService(payload);
        setServices((prev) => [...prev, {
          id: created.id, name: created.name, duration: created.duration,
          price: created.price || 0, currency: (created.currency || 'RSD') as 'RSD' | 'EUR',
          category: created.category || '', discontinued: false,
        }]);
      }
    } catch {
      const local: Service = {
        id: editingService?.id || 'svc-' + Date.now(),
        name: payload.name,
        category: payload.category,
        duration: payload.duration,
        price: payload.price,
        currency: payload.currency as 'RSD' | 'EUR',
        discontinued: false,
      };
      setServices((prev) => editingService
        ? prev.map((s) => (s.id === local.id ? local : s))
        : [...prev, local]);
    }
    setShowServiceModal(false);
    setEditingService(null);
    setServiceForm({ name: '', category: '', duration: 60, price: 0, currency: 'RSD' });
    window.dispatchEvent(new CustomEvent('services-updated'));
  }

  async function deleteService(id: string) {
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  }

  function openNewService() {
    setEditingService(null);
    setServiceForm({ name: '', category: '', duration: 60, price: 0, currency: 'RSD' });
    setShowServiceModal(true);
  }

  function openEditService(service: Service) {
    setEditingService(service);
    setServiceForm({ name: service.name, category: service.category || '', duration: service.duration, price: service.price, currency: service.currency || 'RSD' });
    setShowServiceModal(true);
  }

  function updateWH(id: string, field: keyof WorkingHours, value: string | number) {
    setWorkingHours((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  }

  function addWH() {
    const newId = 'wh-' + Date.now();
    setWorkingHours([...workingHours, { id: newId, day: 'Ponedeljak', from: '08:00:00', to: '16:00:00', concurrent: 1 }]);
  }

  function removeWH(id: string) {
    setWorkingHours((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Firma Postavke</h1>
            <p className="text-[13px] text-text-secondary">Podesi radno vreme, usluge i notifikacije</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-border-subtle overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 py-2 px-4 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap ${
              tab === t.id ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            {t.icon}
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-0 bg-primary-muted rounded-xl -z-10" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        <div key={tab} className="anim-fade-in">
          {/* Radno vreme */}
          {tab === 'radno-vreme' && (
            <div className="max-w-3xl">
              <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Radno vreme</h2>
                    <p className="text-[12px] text-text-tertiary mt-0.5">Definiši radne sate po danima</p>
                  </div>
                  <button onClick={addWH} className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary-hover hover:shadow-btn-hover transition-all">
                    <Plus size={16} /> Dodaj
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-5 py-2.5">Dan</th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-2.5">Od</th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-2.5">Do</th>
                        <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary px-3 py-2.5">Ukupno</th>
                        <th className="px-3 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {workingHours.map((wh) => (
                        <tr key={wh.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-secondary/30 transition-colors">
                          <td className="px-5 py-3">
                            <select
                              value={wh.day}
                              onChange={(e) => updateWH(wh.id, 'day', e.target.value)}
                              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                            >
                              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="time"
                              value={wh.from.slice(0, 5)}
                              onChange={(e) => updateWH(wh.id, 'from', e.target.value + ':00')}
                              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="time"
                              value={wh.to.slice(0, 5)}
                              onChange={(e) => updateWH(wh.id, 'to', e.target.value + ':00')}
                              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={wh.concurrent}
                              onChange={(e) => updateWH(wh.id, 'concurrent', Number(e.target.value))}
                              className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                            >
                              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} istovremeno</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <button onClick={() => removeWH(wh.id)} className="text-text-tertiary hover:text-danger transition-colors p-1">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {workingHours.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                    <Clock size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">Nema definisanog radnog vremena</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usluge */}
          {tab === 'usluge' && (
            <div className="max-w-5xl">
              <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Usluge</h2>
                    <p className="text-[12px] text-text-tertiary mt-0.5">{services.length} usluga · {services.filter(s => !s.discontinued).length} aktivnih</p>
                  </div>
                  <button onClick={openNewService} className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-white text-[13px] font-bold hover:bg-primary-hover hover:shadow-btn-hover transition-all">
                    <Plus size={16} /> Dodaj uslugu
                  </button>
                </div>

                <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      value={serviceSearch}
                      onChange={(event) => setServiceSearch(event.target.value)}
                      placeholder="Pretraži usluge..."
                      className="w-full bg-bg-secondary border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <span className="text-[12px] text-text-tertiary ml-auto">{filteredServices.length} rezultata</span>
                </div>

                <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_150px_130px_100px_32px] items-center gap-3 px-5 py-2.5 border-b border-border-subtle text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  <span>Usluga</span><span>Kategorija</span><span>Trajanje</span><span>Cena</span><span />
                </div>

                <div className="divide-y divide-border-subtle">
                  {filteredServices.map((service, i) => (
                    <div
                      key={service.id}
                      onClick={() => openEditService(service)}
                      style={{ animation: `slide-up 0.18s ease-out ${i * 30}ms both` }}
                      className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px_130px_100px_32px] items-center gap-2 sm:gap-3 px-5 py-3.5 hover:bg-bg-secondary/30 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical size={16} className="hidden sm:block text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                        <div className="w-9 h-9 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                          <Wrench size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{service.name}</p>
                          <p className="text-[12px] text-text-tertiary mt-0.5 sm:hidden">{service.category || 'Bez kategorije'} · {formatDuration(service.duration)}</p>
                        </div>
                      </div>
                      <span className="hidden sm:block text-[13px] text-text-secondary truncate">{service.category || '/'}</span>
                      <span className="hidden sm:block text-[13px] text-text-secondary tabular-nums">{formatDuration(service.duration)}</span>
                      <span className="text-[13px] font-semibold text-text-secondary tabular-nums">
                        {service.price > 0 ? `${service.price} ${service.currency}` : '0 RSD'}
                      </span>
                      {service.discontinued && (
                        <span className="text-[11px] text-danger font-semibold px-2 py-0.5 rounded-full bg-danger-muted">Povučeno</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteService(service.id); }}
                        className="text-text-tertiary hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                {filteredServices.length === 0 && (
                  <div className="py-12 text-center text-sm text-text-tertiary">Nema usluga za zadatu pretragu.</div>
                )}
              </div>
            </div>
          )}

          {/* Notifikacije */}
          {tab === 'notifikacije' && (
            <div className="max-w-2xl space-y-3">
              <div className="p-4 rounded-xl bg-primary-muted border border-primary/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={18} className="text-primary" />
                  <span className="text-sm font-bold text-text-primary">Podsetnik o terminu</span>
                </div>
                <p className="text-[12px] text-text-secondary">
                  Jedan dan unapred šalje poruku klijentu da je termin zakazan za taj dan.
                  Poruka vadi ime iz kalendara, vreme i naziv servisa.
                  Prvo šalje na WhatsApp. Ako klijent nema WhatsApp, šalje na Viber.
                </p>
              </div>

              {[
                { title: 'WhatsApp podsetnik (1 dan unapred)', desc: 'Šalje WhatsApp poruku klijentu dan pre termina sa imenom, vremenom i uslugom', on: true },
                { title: 'Viber fallback', desc: 'Ako klijent nema WhatsApp, poruka se šalje na Viber', on: true },
                { title: 'Notifikacija o otkazivanju', desc: 'Obaveštava radnika pri otkazivanju termina', on: true },
              ].map((item, i) => (
                <ToggleRow key={i} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service add/edit modal */}
      {showServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={() => setShowServiceModal(false)} />
            <div className="relative bg-bg-card border border-border rounded-2xl w-full max-w-md shadow-modal anim-scale-in">
              <div className="px-6 pt-6 pb-4 border-b border-border-subtle flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">{editingService ? 'Izmeni uslugu' : 'Nova usluga'}</h2>
                <button onClick={() => setShowServiceModal(false)} className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Naziv usluge</label>
                  <input
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: capitalizeFirst(e.target.value) })}
                    placeholder="npr. Poliranje Farova"
                    className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Kategorija</label>
                    <input
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: capitalizeFirst(e.target.value) })}
                      placeholder="npr. Poliranje"
                      className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Trajanje (min)</label>
                    <input
                      type="number"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: Number(e.target.value) })}
                      className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Cena</label>
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 block">Valuta</label>
                    <select
                      value={serviceForm.currency}
                      onChange={(e) => setServiceForm({ ...serviceForm, currency: e.target.value })}
                      className="w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="RSD">RSD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border-subtle flex gap-2">
                <button onClick={() => setShowServiceModal(false)} className="flex-1 py-2.5 rounded-xl bg-bg-secondary border border-border text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors">
                  Otkaži
                </button>
                <button onClick={saveService} disabled={!serviceForm.name.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover hover:shadow-btn-hover transition-all disabled:opacity-50 disabled:pointer-events-none">
                  {editingService ? 'Sačuvaj' : 'Dodaj uslugu'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function ToggleRow({ title, desc, on: initialOn }: { title: string; desc: string; on: boolean }) {
  const [on, setOn] = useState(initialOn);
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-card border border-border">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-[12px] text-text-tertiary mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${on ? 'bg-primary' : 'bg-bg-secondary'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${on ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
