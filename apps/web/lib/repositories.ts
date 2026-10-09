import type { HttpClient } from './http-client';

/* ------------------------------------------------------------------ */
/* Tipos de dominio mínimos F0/F1 — crecen por módulo (M01, M02, M04).  */
/* SRP: solo contratos. La validación vive en Zod en cada feature.     */
/* ------------------------------------------------------------------ */

export type Role = 'SUPER_ADMIN' | 'ACCOUNT_ADMIN' | 'ORG_ADMIN' | 'AGENT' | 'REQUESTER';

export interface OrgUnitNode {
  id: string;
  name: string;
  parentId: string | null;
  children?: OrgUnitNode[];
  active: boolean;
}

export interface TicketSummary {
  ref: string;
  title: string;
  status: 'abierto' | 'en_atencion' | 'en_espera' | 'resuelto' | 'cerrado' | 'cancelado';
  priority: 'critica' | 'alta' | 'media' | 'baja';
  requester: string;
  assignee: string | null;
  queue: string | null;
  updatedAt: string;
}

export interface QueueSummary {
  id: string;
  name: string;
  pending: number;
  team: string;
}

/* ------------------------------------------------------------------ */
/* Repository pattern (DIP): features dependen de interfaces,          */
/* no del endpoint. Un repositorio por agregado (M01, M04, M05...).    */
/* ------------------------------------------------------------------ */

export interface OrgUnitRepository {
  list(): Promise<OrgUnitNode[]>;
}

export interface TicketRepository {
  list(): Promise<TicketSummary[]>;
  get(ref: string): Promise<TicketSummary>;
}

export interface QueueRepository {
  list(): Promise<QueueSummary[]>;
}

export class RestOrgUnitRepository implements OrgUnitRepository {
  constructor(private http: HttpClient) {}
  list(): Promise<OrgUnitNode[]> {
    return this.http.send<OrgUnitNode[]>({ path: '/org-units', method: 'GET' });
  }
}

export class RestTicketRepository implements TicketRepository {
  constructor(private http: HttpClient) {}
  list(): Promise<TicketSummary[]> {
    return this.http.send<TicketSummary[]>({ path: '/tickets', method: 'GET' });
  }
  get(ref: string): Promise<TicketSummary> {
    return this.http.send<TicketSummary>({ path: `/tickets/${ref}`, method: 'GET' });
  }
}

export class RestQueueRepository implements QueueRepository {
  constructor(private http: HttpClient) {}
  list(): Promise<QueueSummary[]> {
    return this.http.send<QueueSummary[]>({ path: '/queues', method: 'GET' });
  }
}
