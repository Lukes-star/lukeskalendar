import {
  UsersRound, Calendar, Settings, LogOut,
  ChevronDown, ChevronRight, Home, MapPin, PieChart,
} from 'lucide-react';
import { ReactNode } from 'react';

export type NavSection = 'dashboard' | 'firma' | 'klijenti' | 'termini' | 'kalendar' | 'opste';

interface SidebarProps {
  active: NavSection;
  onSelect: (section: NavSection) => void;
  mobile?: boolean;
}

interface SubEntry {
  label: string;
  icon?: ReactNode;
  section?: NavSection;
}

function NavGroup({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 px-2.5 py-2 text-sm font-bold text-text-primary">
        <span className="text-text-secondary">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronDown size={16} className="text-text-secondary" />
      </div>
      <div className="ml-10 mt-1 space-y-1">{children}</div>
    </div>
  );
}

function SubNav({ entry, active, onSelect }: { entry: SubEntry; active: NavSection; onSelect: (section: NavSection) => void }) {
  const selected = entry.section === active;
  return (
    <button
      onClick={() => entry.section && onSelect(entry.section)}
      className={`flex items-center gap-2 w-full rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition-colors ${
        selected ? 'text-text-primary font-extrabold' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
      }`}
    >
      {entry.icon}
      <span>{entry.label}</span>
    </button>
  );
}

export function Sidebar({ active, onSelect, mobile }: SidebarProps) {
  return (
    <aside className={`${mobile ? 'flex w-72' : 'hidden md:flex w-60'} flex-col bg-bg-card border-r border-border h-full`}>
      <div className="px-4 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-btn-hover ring-2 ring-primary/20 overflow-hidden bg-primary">
            <img src="/logo.png" alt="Servis Farova Čaki" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold text-text-primary truncate">Čaki Admin</div>
            <div className="text-[10px] text-text-tertiary truncate">Servis Farova</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <button
          onClick={() => onSelect('kalendar')}
          className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2.5 mb-2 text-sm font-bold transition-colors ${
            active === 'kalendar' ? 'text-text-primary font-extrabold' : 'text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Calendar size={18} />
          <span>Kalendar</span>
        </button>

        <button
          onClick={() => onSelect('dashboard')}
          className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2.5 mb-4 text-sm transition-colors hover:bg-bg-secondary ${active === 'dashboard' ? 'font-extrabold text-text-primary' : 'font-bold text-text-primary'}`}
        >
          <PieChart size={18} />
          <span>Kontrolna tabla</span>
        </button>

        <NavGroup icon={<Home size={18} />} label="Firma">
          <SubNav entry={{ label: 'Opšte', section: 'firma' }} active={active} onSelect={onSelect} />
          <SubNav entry={{ label: 'Zaposleni', section: 'firma' }} active={active} onSelect={onSelect} />
          <SubNav entry={{ label: 'Lokacije', section: 'firma' }} active={active} onSelect={onSelect} />
          <SubNav entry={{ label: 'Notifikacije', section: 'opste' }} active={active} onSelect={onSelect} />
        </NavGroup>

        <NavGroup icon={<MapPin size={18} />} label="Čaki Servis Farova">
          <SubNav entry={{ label: 'Opšte', section: 'firma' }} active={active} onSelect={onSelect} />
          <SubNav entry={{ label: 'Termini', section: 'termini' }} active={active} onSelect={onSelect} />
        </NavGroup>

        <button
          onClick={() => onSelect('klijenti')}
          className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2.5 text-sm font-bold transition-colors ${
            active === 'klijenti' ? 'text-text-primary font-extrabold' : 'text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <UsersRound size={18} />
          <span>Klijenti</span>
          <ChevronRight size={15} className="ml-auto text-text-tertiary" />
        </button>
      </nav>

      <div className="px-3 py-3 border-t border-border-subtle space-y-1">
        <button className="flex items-center gap-3 w-full py-2 px-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
          <Settings size={17} /> Postavke
        </button>
        <button className="flex items-center gap-3 w-full py-2 px-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger-muted transition-colors">
          <LogOut size={17} /> Odjava
        </button>
      </div>
    </aside>
  );
}
