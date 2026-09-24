import { useState, useEffect } from 'react';
import { X, User, Phone, Car, Check, Plus, Trash2, StickyNote } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Client, Vehicle } from '@/types/calendar';
import { capitalizeFirst } from '@/lib/text';

interface ClientEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
}

export function ClientEditModal({ open, onClose, onSave, client }: ClientEditModalProps) {
  const isEdit = !!client;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (open) {
      setFirstName(client?.firstName || '');
      setLastName(client?.lastName || '');
      setPhone(client?.phone || '');
      setNote((client as any)?.note || '');
      setVehicles(client?.vehicles || []);
    }
  }, [open, client]);

  function handleSave() {
    const newClient: Client = {
      id: client?.id || 'new-' + Date.now(),
      firstName, lastName,
      name: `${firstName} ${lastName}`.trim(),
      phone,
      note: note || undefined,
      currency: client?.currency || 'RSD',
      vehicles,
      isActive: client?.isActive ?? true,
      noShow: client?.noShow || 0,
      totalAppointments: client?.totalAppointments || 0,
      totalEarnings: client?.totalEarnings || 0,
      createdAt: client?.createdAt || new Date().toISOString().split('T')[0],
    } as any;
    onSave(newClient);
    onClose();
  }

  function addVehicle() { setVehicles([...vehicles, { make: '', model: '', plate: '' }]); }
  function updateVehicle(idx: number, field: keyof Vehicle, value: string) {
    setVehicles(vehicles.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  }
  function removeVehicle(idx: number) { setVehicles(vehicles.filter((_, i) => i !== idx)); }

  const inputCls = 'w-full bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all';
  const inputSmCls = 'w-full bg-bg-card border border-border rounded-lg py-2 px-3 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors';

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">{isEdit ? 'Izmeni klijenta' : 'Novi klijent'}</h2>
            <p className="text-[12px] text-text-tertiary mt-0.5">{isEdit ? 'Ažuriraj podatke klijenta' : 'Dodaj novog klijenta u bazu'}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
        {/* Osnovni podaci */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Osnovni podaci</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ime" icon={<User size={13} />}>
              <input value={firstName} onChange={(e) => setFirstName(capitalizeFirst(e.target.value))} placeholder="Marko" className={inputCls} />
            </FormField>
            <FormField label="Prezime" icon={<User size={13} />}>
              <input value={lastName} onChange={(e) => setLastName(capitalizeFirst(e.target.value))} placeholder="Petrović" className={inputCls} />
            </FormField>
            <FormField label="Telefon" icon={<Phone size={13} />}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+381 60 123 4567" className={inputCls} />
            </FormField>
          </div>
        </div>

        {/* Napomena */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Napomena</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Napomena o klijentu (npr. preferencije, specifičnosti vozila...)"
            className="w-full min-h-[90px] bg-bg-secondary border border-border rounded-xl py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          />
        </div>

        {/* Vozila */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Car size={14} className="text-text-tertiary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Vozila</span>
            </div>
            <button onClick={addVehicle} className="flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary-hover transition-colors">
              <Plus size={14} /> Dodaj vozilo
            </button>
          </div>
          <div className="space-y-3">
            {vehicles.map((v, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded-xl p-3 anim-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <Car size={14} />
                    <span className="text-[12px] font-semibold">Vozilo {i + 1}</span>
                  </div>
                  <button onClick={() => removeVehicle(i)} className="text-text-tertiary hover:text-danger transition-colors p-1 rounded hover:bg-danger-muted">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={v.make} onChange={(e) => updateVehicle(i, 'make', capitalizeFirst(e.target.value))} placeholder="Marka" className={inputSmCls} />
                  <input value={v.model} onChange={(e) => updateVehicle(i, 'model', capitalizeFirst(e.target.value))} placeholder="Model" className={inputSmCls} />
                  <input value={v.plate} onChange={(e) => updateVehicle(i, 'plate', e.target.value.toUpperCase())} placeholder="Reg." className={`${inputSmCls} uppercase font-mono`} />
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <button onClick={addVehicle} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-text-tertiary hover:text-primary hover:border-primary/40 hover:bg-primary-muted/20 transition-all">
                <Plus size={18} />
                <span className="text-sm font-semibold">Dodaj prvo vozilo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border-subtle flex gap-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={onClose} icon={<X size={16} />}>Otkaži</Button>
        <Button variant="primary" size="md" className="flex-1" onClick={handleSave} icon={<Check size={16} />} disabled={!firstName || !phone}>
          {isEdit ? 'Sačuvaj izmene' : 'Kreiraj klijenta'}
        </Button>
      </div>
    </Modal>
  );
}

function FormField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
