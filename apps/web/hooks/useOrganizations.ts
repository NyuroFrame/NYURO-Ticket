import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface Organization {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  code?: string;
  isActive?: boolean;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async (tenantId: string) => {
    setLoading(true);
    setError(null);
    const res = await api.get<Organization[]>(`/tenants/${tenantId}/organizations`);
    if (res.data) {
      setOrganizations(res.data);
    } else {
      setError(res.error ?? 'Error al cargar organizaciones');
    }
    setLoading(false);
  }, []);

  const createOrganization = useCallback(async (tenantId: string, data: CreateOrganizationData) => {
    setError(null);
    const res = await api.post<Organization>(`/tenants/${tenantId}/organizations`, data);
    if (res.data) {
      setOrganizations((prev) => [res.data!, ...prev]);
      return { success: true as const, organization: res.data };
    }
    setError(res.error ?? 'Error al crear organizacion');
    return { success: false as const, error: res.error ?? 'Error al crear organizacion' };
  }, []);

  const updateOrganization = useCallback(async (tenantId: string, id: string, data: UpdateOrganizationData) => {
    setError(null);
    const res = await api.patch<Organization>(`/tenants/${tenantId}/organizations/${id}`, data);
    if (res.data) {
      setOrganizations((prev) =>
        prev.map((o) => (o.id === id ? res.data! : o))
      );
      return { success: true as const, organization: res.data };
    }
    setError(res.error ?? 'Error al actualizar organizacion');
    return { success: false as const, error: res.error ?? 'Error al actualizar organizacion' };
  }, []);

  const deleteOrganization = useCallback(async (tenantId: string, id: string) => {
    setError(null);
    const res = await api.delete<{ message: string }>(`/tenants/${tenantId}/organizations/${id}`);
    if (res.data) {
      setOrganizations((prev) => prev.filter((o) => o.id !== id));
      return { success: true as const };
    }
    setError(res.error ?? 'Error al eliminar organizacion');
    return { success: false as const, error: res.error ?? 'Error al eliminar organizacion' };
  }, []);

  return {
    organizations,
    loading,
    error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };
}
