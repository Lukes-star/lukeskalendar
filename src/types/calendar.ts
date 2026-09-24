export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Vehicle {
  make: string;
  model: string;
  plate: string;
  year?: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // computed: firstName + lastName
  phone: string;
  email?: string;
  address?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  tags?: string[];
  blocked?: boolean;
  isActive?: boolean;
  noShow?: number;
  vehicles: Vehicle[];
  totalAppointments?: number;
  totalEarnings?: number;
  note?: string;
  currency?: 'RSD' | 'EUR';
  createdAt?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  currency?: 'RSD' | 'EUR';
  category?: string;
  groupId?: string;
  resourceId?: string;
  discontinued?: boolean;
  internal?: boolean;
}

export interface ServiceGroup {
  id: string;
  name: string;
}

export interface WorkingHours {
  id: string;
  day: string;
  from: string;
  to: string;
  concurrent: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  vehicle: Vehicle;
  serviceId: string;
  serviceName: string;
  duration: number;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  note?: string;
  status: AppointmentStatus;
  employeeId?: string;
  employeeName?: string;
  imageUrl?: string;
}

export interface Employee {
  id: string;
  name: string;
}

export type CalendarView = 'month' | 'week' | 'day' | 'year';

export interface TimeSlot {
  time: string;
  type: 'available' | 'booked' | 'break' | 'vacation';
  appointmentId?: string;
}

export type AppView = 'kalendar' | 'klijenti' | 'klijent-detalji' | 'firma' | 'termini';
