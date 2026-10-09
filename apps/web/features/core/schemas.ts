import { z } from 'zod';

/** M01-HU-001/005: crear y renombrar unidad sin perder relaciones (solo id + nombre). */
export const orgUnitSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(80),
  parentId: z.string().nullable().optional(),
});

export type OrgUnitInput = z.infer<typeof orgUnitSchema>;

/** M04-HU-001/002: reporte mínimo de problema. */
export const ticketCreateSchema = z.object({
  title: z.string().min(8, 'Describe el problema con más detalle').max(140),
  description: z.string().min(10, 'Añade información para el diagnóstico').max(5000),
  orgUnitId: z.string().min(1, 'Ubica el ticket en tu organización'),
  assetId: z.string().optional(),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;

/** M05-HU-011/014: asignación manual o reasignación (una sola responsabilidad). */
export const assignTicketSchema = z.object({
  ref: z.string().min(1),
  assignee: z.string().min(1, 'Elige un agente'),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
