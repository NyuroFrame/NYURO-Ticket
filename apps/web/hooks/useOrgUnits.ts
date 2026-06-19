import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface OrgUnit {
  id: string;
  tenantId: string;
  organizationId: string;
  parentId: string | null;
  name: string;
  managerName: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useOrgUnits() {
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgUnitsByOrgCode = useCallback(async (orgCode: string) => {
    setLoading(true);
    setError(null);
    const res = await api.get<{ id: string; name: string; managerName: string | null; description: string | null }[]>(`/public/org-units/${orgCode}`);
    if (res.data) {
      setOrgUnits(res.data.map((u) => ({
        id: u.id,
        tenantId: '',
        organizationId: '',
        parentId: null,
        name: u.name,
        managerName: u.managerName,
        description: u.description,
        email: null,
        phone: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })));
    } else {
      setError(res.error ?? 'Error al cargar areas');
    }
    setLoading(false);
  }, []);

  return {
    orgUnits,
    loading,
    error,
    fetchOrgUnitsByOrgCode,
  };
}
