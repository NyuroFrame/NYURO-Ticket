import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  organizationId: string;
  orgUnitId: string;
  createdById: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string };
  assignee?: { id: string; name: string } | null;
  orgUnit?: { id: string; name: string };
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<Ticket[]>('/tickets/my');
    if (res.data) {
      setTickets(res.data);
    } else {
      setError(res.error ?? 'Error al cargar tickets');
    }
    setLoading(false);
  }, []);

  const fetchOrganizationTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<Ticket[]>('/tickets/organization');
    if (res.data) {
      setTickets(res.data);
    } else {
      setError(res.error ?? 'Error al cargar tickets');
    }
    setLoading(false);
  }, []);

  const fetchAssignedTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<Ticket[]>('/tickets/assigned');
    if (res.data) {
      setTickets(res.data);
    } else {
      setError(res.error ?? 'Error al cargar tickets');
    }
    setLoading(false);
  }, []);

  const createTicket = useCallback(async (data: CreateTicketData) => {
    setError(null);
    const res = await api.post<Ticket>('/tickets', data);
    if (res.data) {
      setTickets((prev) => [res.data!, ...prev]);
      return { success: true as const, ticket: res.data };
    }
    setError(res.error ?? 'Error al crear ticket');
    return { success: false as const, error: res.error ?? 'Error al crear ticket' };
  }, []);

  const updateTicket = useCallback(async (id: string, data: UpdateTicketData) => {
    setError(null);
    const res = await api.patch<Ticket>(`/tickets/${id}`, data);
    if (res.data) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? res.data! : t))
      );
      return { success: true as const, ticket: res.data };
    }
    setError(res.error ?? 'Error al actualizar ticket');
    return { success: false as const, error: res.error ?? 'Error al actualizar ticket' };
  }, []);

  const assignTicket = useCallback(async (id: string, assigneeId: string) => {
    setError(null);
    const res = await api.patch<Ticket>(`/tickets/${id}/assign`, { assigneeId });
    if (res.data) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? res.data! : t))
      );
      return { success: true as const, ticket: res.data };
    }
    setError(res.error ?? 'Error al asignar ticket');
    return { success: false as const, error: res.error ?? 'Error al asignar ticket' };
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchMyTickets,
    fetchOrganizationTickets,
    fetchAssignedTickets,
    createTicket,
    updateTicket,
    assignTicket,
  };
}
