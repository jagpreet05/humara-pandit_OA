import type { Client, ClientFilters } from '../../types/client';
import { mockClients } from '../mock-data/clients';
import { delay } from '../utils';

let clientsStore: Client[] = [...mockClients];

export const clientsApi = {
  getAll: async (filters?: Partial<ClientFilters>): Promise<Client[]> => {
    await delay(350);
    let result = [...clientsStore];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((c) => c.status === filters.status);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Client | null> => {
    await delay(250);
    return clientsStore.find((c) => c.id === id) ?? null;
  },

  create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    await delay(500);
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    clientsStore = [newClient, ...clientsStore];
    return newClient;
  },

  update: async (id: string, updates: Partial<Client>): Promise<Client> => {
    await delay(400);
    const idx = clientsStore.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    clientsStore[idx] = { ...clientsStore[idx], ...updates };
    return clientsStore[idx];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    clientsStore = clientsStore.filter((c) => c.id !== id);
  },
};
