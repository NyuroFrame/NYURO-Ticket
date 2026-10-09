import type { OrgUnitNode, QueueSummary, TicketSummary } from './repositories';

/**
 * Factory (Creational): datos mock coherentes por tenant para F1.
 * M01 árbol + M04 tickets + M05 colas con referencias cruzadas estables.
 */
export const mockOrgUnits: OrgUnitNode[] = [
  { id: 'ou-ti', name: 'Tecnología', parentId: null, active: true },
  { id: 'ou-soporte', name: 'Soporte', parentId: 'ou-ti', active: true },
  { id: 'ou-infra', name: 'Infraestructura', parentId: 'ou-ti', active: true },
  { id: 'ou-adm', name: 'Administración', parentId: null, active: true },
  { id: 'ou-legado', name: 'Archivo (inactiva)', parentId: null, active: false },
];

export const mockTickets: TicketSummary[] = [
  {
    ref: 'NYU-1042',
    title: 'Caída de correo en Soporte',
    status: 'en_atencion',
    priority: 'alta',
    requester: 'Ana Torres',
    assignee: 'Luis Paredes',
    queue: 'q-n1',
    updatedAt: '2026-10-01T14:30:00.000Z',
  },
  {
    ref: 'NYU-1041',
    title: 'Instalar VPN en laptop nueva',
    status: 'abierto',
    priority: 'media',
    requester: 'Marco Ruiz',
    assignee: null,
    queue: 'q-n1',
    updatedAt: '2026-10-02T09:10:00.000Z',
  },
  {
    ref: 'NYU-1040',
    title: 'Error de impresión en Administración',
    status: 'en_espera',
    priority: 'baja',
    requester: 'Lucía Díaz',
    assignee: 'Sofía Vega',
    queue: 'q-n2',
    updatedAt: '2026-09-28T16:00:00.000Z',
  },
  {
    ref: 'NYU-1039',
    title: 'Acceso a carpeta compartida',
    status: 'resuelto',
    priority: 'media',
    requester: 'Pedro León',
    assignee: 'Luis Paredes',
    queue: 'q-n2',
    updatedAt: '2026-09-20T11:00:00.000Z',
  },
];

export const mockQueues: QueueSummary[] = [
  { id: 'q-n1', name: 'Nivel 1 — General', pending: 2, team: 'Soporte' },
  { id: 'q-n2', name: 'Nivel 2 — Infraestructura', pending: 1, team: 'Infraestructura' },
];

/** Construye el árbol M01-HU-002/006 desde lista plana (pura, testeable). */
export function buildOrgTree(units: OrgUnitNode[]): OrgUnitNode[] {
  const byId = new Map(units.map((u) => [u.id, { ...u, children: [] as OrgUnitNode[] }]));
  const roots: OrgUnitNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
