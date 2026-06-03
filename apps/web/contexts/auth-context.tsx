'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  role: string;
  tenantId: string;
}

interface Tenant {
  id: string;
  code: string;
  name: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (name: string, password: string) => Promise<string | null>;
  register: (name: string, password: string, tenantCode: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, tenant: null, loading: true });

  const checkAuth = useCallback(async () => {
    const res = await api.get<{ user: User; tenant: Tenant }>('/auth/me');
    if (res.data) {
      setState({ user: res.data.user, tenant: res.data.tenant, loading: false });
    } else {
      setState({ user: null, tenant: null, loading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (name: string, password: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant }>('/auth/login', { name, password });
    if (res.data) {
      setState({ user: res.data.user, tenant: res.data.tenant, loading: false });
      return null;
    }
    return res.error ?? 'Login failed';
  }, []);

  const register = useCallback(async (name: string, password: string, tenantCode: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant }>('/auth/register', { name, password, tenantCode });
    if (res.data) {
      setState({ user: res.data.user, tenant: res.data.tenant, loading: false });
      return null;
    }
    return res.error ?? 'Registration failed';
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {});
    setState({ user: null, tenant: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
