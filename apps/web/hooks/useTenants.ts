import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantData {
  name: string;
  slug?: string;
  isActive?: boolean;
}

export interface CreateTenantWithOwnerData {
  tenantName: string;
  tenantSlug?: string;
  isActive?: boolean;
  ownerName: string;
}

export interface CreateTenantWithOwnerResponse {
  tenant: Tenant;
  owner: {
    id: string;
    name: string;
    role: string;
    tenantId: string | null;
  };
  tempPassword: string;
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<Tenant[]>('/tenants');
    if (res.data) {
      setTenants(res.data);
    } else {
      setError(res.error ?? 'Error al cargar tenants');
    }
    setLoading(false);
  }, []);

  const createTenant = useCallback(async (data: CreateTenantData) => {
    setError(null);
    const res = await api.post<Tenant>('/tenants', data);
    if (res.data) {
      setTenants((prev) => [res.data!, ...prev]);
      return { success: true as const, tenant: res.data };
    }
    setError(res.error ?? 'Error al crear tenant');
    return { success: false as const, error: res.error ?? 'Error al crear tenant' };
  }, []);

  const createTenantWithOwner = useCallback(async (data: CreateTenantWithOwnerData) => {
    setError(null);
    const res = await api.post<CreateTenantWithOwnerResponse>('/tenants/with-owner', data);
    if (res.data) {
      setTenants((prev) => [res.data!.tenant, ...prev]);
      return { success: true as const, data: res.data };
    }
    setError(res.error ?? 'Error al crear tenant con owner');
    return { success: false as const, error: res.error ?? 'Error al crear tenant con owner' };
  }, []);

  const updateTenant = useCallback(async (id: string, data: UpdateTenantData) => {
    setError(null);
    const res = await api.patch<Tenant>(`/tenants/${id}`, data);
    if (res.data) {
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? res.data! : t))
      );
      return { success: true as const, tenant: res.data };
    }
    setError(res.error ?? 'Error al actualizar tenant');
    return { success: false as const, error: res.error ?? 'Error al actualizar tenant' };
  }, []);

  const deleteTenant = useCallback(async (id: string) => {
    setError(null);
    const res = await api.delete<{ message: string }>(`/tenants/${id}`);
    if (res.data) {
      setTenants((prev) => prev.filter((t) => t.id !== id));
      return { success: true as const };
    }
    setError(res.error ?? 'Error al eliminar tenant');
    return { success: false as const, error: res.error ?? 'Error al eliminar tenant' };
  }, []);

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    createTenant,
    createTenantWithOwner,
    updateTenant,
    deleteTenant,
  };
}
