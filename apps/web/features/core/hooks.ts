import { useQuery } from '@tanstack/react-query';
import { FetchHttpClient } from '../../lib/http-client';
import { getActiveTenantId } from '../../lib/tenant-store';
import { mockOrgUnits, mockQueues, mockTickets } from '../../lib/mocks';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Adapter con degradación a mock: el núcleo sigue operando
 * aunque el backend no esté disponible (principio M04 resiliente).
 */
async function getOrMock<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await new FetchHttpClient(API, getActiveTenantId).send<T>({
      path,
      method: 'GET',
    });
    return data;
  } catch {
    return fallback;
  }
}

export function useOrgUnits() {
  return useQuery({
    queryKey: ['org-units', getActiveTenantId()],
    queryFn: () => getOrMock('/org-units', mockOrgUnits),
  });
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets', getActiveTenantId()],
    queryFn: () => getOrMock('/tickets', mockTickets),
  });
}

export function useQueues() {
  return useQuery({
    queryKey: ['queues', getActiveTenantId()],
    queryFn: () => getOrMock('/queues', mockQueues),
  });
}

export { buildOrgTree } from '../../lib/mocks';
