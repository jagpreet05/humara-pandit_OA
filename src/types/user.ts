export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'consultant' | 'viewer';
  avatar?: string;
  initials: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}
