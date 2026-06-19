'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  role: string;
  tenantId: string | null;
  organizationId: string | null;
  orgUnitId: string | null;
  mustResetPassword: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface Organization {
  id: string;
  code: string;
  name: string;
}

interface OrgUnit {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  organization: Organization | null;
  orgUnit: OrgUnit | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  adminLogin: (name: string, password: string) => Promise<string | null>;
  orgLogin: (orgCode: string, name: string, password: string) => Promise<string | null>;
  register: (name: string, password: string, orgCode: string, orgUnitId?: string) => Promise<string | null>;
  resetPassword: (newPassword: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ 
    user: null, 
    tenant: null, 
    organization: null,
    orgUnit: null,
    loading: true 
  });

  const checkAuth = useCallback(async () => {
    const res = await api.get<{ user: User; tenant: Tenant; organization: Organization; orgUnit: OrgUnit }>('/auth/me');
    if (res.data) {
      setState({ 
        user: res.data.user, 
        tenant: res.data.tenant, 
        organization: res.data.organization,
        orgUnit: res.data.orgUnit,
        loading: false 
      });
      // Si el usuario debe restablecer contraseña, redirigir
      if (res.data.user.mustResetPassword && router.pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
    } else {
      setState({ user: null, tenant: null, organization: null, orgUnit: null, loading: false });
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const adminLogin = useCallback(async (name: string, password: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant; mustResetPassword: boolean }>('/auth/login/admin', { name, password });
    if (res.data) {
      setState({ user: res.data.user, tenant: res.data.tenant, organization: null, orgUnit: null, loading: false });
      // Si debe restablecer contraseña, redirigir
      if (res.data.mustResetPassword || res.data.user.mustResetPassword) {
        router.replace('/reset-password');
      }
      return null;
    }
    return res.error ?? 'Login failed';
  }, [router]);

  const orgLogin = useCallback(async (orgCode: string, name: string, password: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant; organization: Organization; orgUnit: OrgUnit }>('/auth/login/org', { orgCode, name, password });
    if (res.data) {
      setState({ 
        user: res.data.user, 
        tenant: res.data.tenant, 
        organization: res.data.organization,
        orgUnit: res.data.orgUnit,
        loading: false 
      });
      if (res.data.user.mustResetPassword && router.pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
      return null;
    }
    return res.error ?? 'Login failed';
  }, [router]);

  const register = useCallback(async (name: string, password: string, orgCode: string, orgUnitId?: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant; organization: Organization; orgUnit: OrgUnit }>('/auth/register', { name, password, orgCode, orgUnitId });
    if (res.data) {
      setState({ 
        user: res.data.user, 
        tenant: res.data.tenant, 
        organization: res.data.organization,
        orgUnit: res.data.orgUnit,
        loading: false 
      });
      if (res.data.user.mustResetPassword && router.pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
      return null;
    }
    return res.error ?? 'Registration failed';
  }, [router]);

  const resetPassword = useCallback(async (newPassword: string): Promise<string | null> => {
    const res = await api.post<{ user: User; tenant: Tenant; organization: Organization; orgUnit: OrgUnit }>('/auth/reset-password', { newPassword });
    if (res.data) {
      setState({ 
        user: res.data.user, 
        tenant: res.data.tenant, 
        organization: res.data.organization,
        orgUnit: res.data.orgUnit,
        loading: false 
      });
      return null;
    }
    return res.error ?? 'Failed to reset password';
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {});
    setState({ user: null, tenant: null, organization: null, orgUnit: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, adminLogin, orgLogin, register, resetPassword, logout }}>
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
