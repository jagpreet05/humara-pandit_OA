import type { User, LoginCredentials } from '../../types/user';
import { delay } from '../utils';

const mockUser: User = {
  id: 'usr-001',
  name: 'Vikram Consultants',
  email: 'admin@vikramconsultants.in',
  role: 'admin',
  initials: 'VC',
  avatarColor: '#6366f1',
  createdAt: '2024-01-01T00:00:00Z',
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    await delay(800);
    // Accept any email/password for demo
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    if (credentials.password.length < 4) {
      throw new Error('Invalid email or password');
    }
    return { ...mockUser, email: credentials.email };
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },

  getProfile: async (): Promise<User> => {
    await delay(200);
    return mockUser;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    await delay(400);
    return { ...mockUser, ...updates };
  },
};
