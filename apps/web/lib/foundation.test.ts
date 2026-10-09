import { describe, expect, it } from 'vitest';
import { navForRole, sectionsOf } from './navigation';
import { getActiveTenantId, useTenantStore } from './tenant-store';
import { formatDateTime, ticketRef } from './format';
import { InMemoryHttpClient } from './http-client';
import { RestTicketRepository } from './repositories';

describe('navigation por rol (Strategy)', () => {
  it('agente ve mi-trabajo y no ve billing', () => {
    const nav = navForRole('AGENT');
    expect(nav.some((n) => n.href === '/mi-trabajo')).toBe(true);
    expect(nav.some((n) => n.href.includes('billing'))).toBe(false);
  });

  it('requester solo ve gestiones propias', () => {
    const nav = navForRole('REQUESTER');
    expect(nav.map((n) => n.href)).toEqual(
      expect.arrayContaining(['/mis-tickets', '/catalogo', '/kb']),
    );
  });

  it('agrupa por sección sin duplicar orden', () => {
    const sections = sectionsOf(navForRole('ACCOUNT_ADMIN'));
    expect(sections.length).toBeGreaterThan(1);
    expect(sections[0].items.length).toBeGreaterThan(0);
  });
});

describe('tenant store M01-E04', () => {
  it('cambiar de cliente reemplaza el contexto anterior', () => {
    useTenantStore.getState().setActiveContext({ tenantId: 't1', tenantName: 'A' });
    expect(getActiveTenantId()).toBe('t1');
    useTenantStore.getState().setActiveContext({ tenantId: 't2', tenantName: 'B' });
    expect(getActiveTenantId()).toBe('t2');
    expect(useTenantStore.getState().tenantName).toBe('B');
  });
});

describe('format', () => {
  it('referencia en mayúsculas', () => {
    expect(ticketRef('nyu-1042')).toBe('NYU-1042');
  });
  it('fecha corta es', () => {
    expect(formatDateTime('2026-03-10T14:30:00.000Z')).toContain('mar');
  });
});

describe('repositorio tickets (DIP)', () => {
  it('lee lista desde cualquier HttpClient', async () => {
    const http = new InMemoryHttpClient().on('/tickets', [{ ref: 'NYU-1' }]);
    const repo = new RestTicketRepository(http);
    await expect(repo.list()).resolves.toEqual([{ ref: 'NYU-1' }]);
  });
});
