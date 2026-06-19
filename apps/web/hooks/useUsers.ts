import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  role: string;
  tenantId: string | null;
  organizationId: string | null;
  createdAt: string;
}

export interface CreateItManagerData {
  name: string;
  password: string;
  organizationId: string;
}

export interface CreateAgentData {
  name: string;
  password: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<User[]>('/auth/users');
    if (res.data) {
      setUsers(res.data);
    } else {
      setError(res.error ?? 'Error al cargar usuarios');
    }
    setLoading(false);
  }, []);

  const createItManager = useCallback(async (data: CreateItManagerData) => {
    setError(null);
    const res = await api.post<User>('/auth/users/it-manager', data);
    if (res.data) {
      setUsers((prev) => [res.data!, ...prev]);
      return { success: true as const, user: res.data };
    }
    setError(res.error ?? 'Error al crear IT Manager');
    return { success: false as const, error: res.error ?? 'Error al crear IT Manager' };
  }, []);

  const createAgent = useCallback(async (data: CreateAgentData) => {
    setError(null);
    const res = await api.post<User>('/auth/users/agent', data);
    if (res.data) {
      setUsers((prev) => [res.data!, ...prev]);
      return { success: true as const, user: res.data };
    }
    setError(res.error ?? 'Error al crear agente');
    return { success: false as const, error: res.error ?? 'Error al crear agente' };
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createItManager,
    createAgent,
  };
}
