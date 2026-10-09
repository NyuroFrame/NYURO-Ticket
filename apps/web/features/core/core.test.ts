import { describe, expect, it } from 'vitest';
import { buildOrgTree, mockOrgUnits, mockTickets } from '../../lib/mocks';
import type { OrgUnitNode } from '../../lib/repositories';
import { orgUnitSchema, ticketCreateSchema, assignTicketSchema } from './schemas';

describe('M01 árbol organizacional', () => {
  it('anida Soporte bajo Tecnología', () => {
    const roots = buildOrgTree(mockOrgUnits);
    const ti = roots.find((r) => r.id === 'ou-ti');
    expect(ti?.children?.map((c: OrgUnitNode) => c.id)).toEqual(
      expect.arrayContaining(['ou-soporte', 'ou-infra']),
    );
  });
  it('rechaza nombre vacío (M01-HU-001)', () => {
    expect(orgUnitSchema.safeParse({ name: '' }).success).toBe(false);
    expect(orgUnitSchema.safeParse({ name: 'Soporte' }).success).toBe(true);
  });
});

describe('M04 crear ticket', () => {
  it('exige título y descripción suficientes', () => {
    expect(
      ticketCreateSchema.safeParse({ title: 'x', description: 'y', orgUnitId: 'ou-soporte' }).success,
    ).toBe(false);
    expect(
      ticketCreateSchema.safeParse({
        title: 'No funciona el correo corporativo',
        description: 'Desde ayer no sincroniza y muestra error 500 al enviar.',
        orgUnitId: 'ou-soporte',
      }).success,
    ).toBe(true);
  });
  it('mock F1 trae 4 tickets con refs únicas', () => {
    const refs = new Set(mockTickets.map((t) => t.ref));
    expect(refs.size).toBe(mockTickets.length);
  });
});

describe('M05 asignación', () => {
  it('exige agente', () => {
    expect(assignTicketSchema.safeParse({ ref: 'NYU-1041', assignee: '' }).success).toBe(false);
    expect(assignTicketSchema.safeParse({ ref: 'NYU-1041', assignee: 'ag-01' }).success).toBe(true);
  });
});
