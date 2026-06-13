export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  initials: string;
  totalSessions: number;
  totalHours: number;
  lastSession: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
  avatarColor: string;
}

export interface ClientFilters {
  search: string;
  status: ClientStatus | 'all';
}
