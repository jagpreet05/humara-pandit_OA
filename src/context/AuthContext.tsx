import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LoginCredentials, AuthState } from '../types/user';
import { authApi } from '../lib/mock-api/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = sessionStorage.getItem('crm-user');
    if (savedUser) {
      try {
        return { user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false };
      } catch {
        /* ignore */
      }
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const user = await authApi.login(credentials);
      if (credentials.rememberMe) {
        sessionStorage.setItem('crm-user', JSON.stringify(user));
      }
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('crm-user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
