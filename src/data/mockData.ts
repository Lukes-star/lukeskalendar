import { Service, WorkingHours } from '@/types/calendar';

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Reparacija Fara Zamena Stakla', duration: 240, price: 0, currency: 'RSD', category: 'Reparacija' },
  { id: 's2', name: 'Poliranje Farova', duration: 150, price: 0, currency: 'RSD', category: 'Poliranje' },
  { id: 's3', name: 'Masinsko Poliranje Farova', duration: 300, price: 0, currency: 'RSD', category: 'Poliranje' },
  { id: 's4', name: 'Ugradnja Led Sijalica', duration: 210, price: 0, currency: 'RSD', category: 'Ugradnja' },
  { id: 's5', name: 'Zamena Modula', duration: 180, price: 0, currency: 'RSD', category: 'Zamena' },
  { id: 's6', name: 'Zamena DRL Modula',  duration: 270, price: 0, currency: 'RSD', category: 'Zamena' },
  { id: 's7', name: 'Ispitivanje Fara', duration: 120, price: 0, currency: 'RSD', category: 'Dijagnostika' },
  { id: 's8', name: 'Resavanje Dnevno Svetlo', duration: 270, price: 0, currency: 'RSD', category: 'Reparacija' },
];

export const MOCK_WORKING_HOURS: WorkingHours[] = [
  { id: 'wh1', day: 'Ponedeljak', from: '08:00:00', to: '16:00:00', concurrent: 1 },
  { id: 'wh2', day: 'Utorak', from: '08:00:00', to: '16:00:00', concurrent: 1 },
  { id: 'wh3', day: 'Sreda', from: '08:00:00', to: '16:00:00', concurrent: 1 },
  { id: 'wh4', day: 'Četvrtak', from: '08:00:00', to: '16:00:00', concurrent: 1 },
  { id: 'wh5', day: 'Petak', from: '08:00:00', to: '16:00:00', concurrent: 1 },
  { id: 'wh6', day: 'Subota', from: '09:00:00', to: '15:00:00', concurrent: 1 },
];
