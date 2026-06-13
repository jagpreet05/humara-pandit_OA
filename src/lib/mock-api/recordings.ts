import type { Recording, PaginatedRecordings, RecordingFilters } from '../../types/recording';
import { mockRecordings } from '../mock-data/recordings';
import { delay } from '../utils';

// In-memory store (simulates a database)
let recordingsStore: Recording[] = [...mockRecordings];

export const recordingsApi = {
  // GET all recordings with optional filters and pagination
  getAll: async (
    filters?: Partial<RecordingFilters>,
    page = 1,
    perPage = 10
  ): Promise<PaginatedRecordings> => {
    await delay(400);
    let result = [...recordingsStore];

    // Apply filters
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters?.clientId && filters.clientId !== 'all') {
      result = result.filter((r) => r.clientId === filters.clientId);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.dateFrom) {
      result = result.filter((r) => r.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((r) => r.date <= filters.dateTo!);
    }

    // Apply sort
    const sortBy = filters?.sortBy ?? 'date_desc';
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return a.date.localeCompare(b.date);
        case 'date_desc': return b.date.localeCompare(a.date);
        case 'duration_asc': return a.duration - b.duration;
        case 'duration_desc': return b.duration - a.duration;
        case 'title_asc': return a.title.localeCompare(b.title);
        default: return b.date.localeCompare(a.date);
      }
    });

    const total = result.length;
    const totalPages = Math.ceil(total / perPage);
    const data = result.slice((page - 1) * perPage, page * perPage);

    return { data, total, page, perPage, totalPages };
  },

  // GET single recording by id
  getById: async (id: string): Promise<Recording | null> => {
    await delay(300);
    return recordingsStore.find((r) => r.id === id) ?? null;
  },

  // POST create a new recording
  create: async (recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording> => {
    await delay(600);
    const newRecording: Recording = {
      ...recording,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    recordingsStore = [newRecording, ...recordingsStore];
    return newRecording;
  },

  // PATCH update a recording
  update: async (id: string, updates: Partial<Recording>): Promise<Recording> => {
    await delay(400);
    const idx = recordingsStore.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Recording not found');
    recordingsStore[idx] = { ...recordingsStore[idx], ...updates, updatedAt: new Date().toISOString() };
    return recordingsStore[idx];
  },

  // DELETE a recording
  delete: async (id: string): Promise<void> => {
    await delay(300);
    recordingsStore = recordingsStore.filter((r) => r.id !== id);
  },

  // GET analytics data for dashboard
  getAnalytics: async () => {
    await delay(350);
    const total = recordingsStore.length;
    const totalSeconds = recordingsStore.reduce((sum, r) => sum + r.duration, 0);
    const totalHours = totalSeconds / 3600;
    const uniqueClients = new Set(recordingsStore.map((r) => r.clientId)).size;

    // Monthly activity (last 6 months)
    const monthlyData = generateMonthlyData(recordingsStore);

    return { total, totalHours: Math.round(totalHours * 10) / 10, uniqueClients, monthlyData };
  },
};

function generateMonthlyData(recordings: Recording[]) {
  const months: Record<string, { month: string; recordings: number; hours: number }> = {};
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    months[key] = { month: label, recordings: 0, hours: 0 };
  }

  recordings.forEach((r) => {
    const key = r.date.slice(0, 7);
    if (months[key]) {
      months[key].recordings += 1;
      months[key].hours += Math.round((r.duration / 3600) * 10) / 10;
    }
  });

  return Object.values(months);
}
