import { z } from 'zod';

/** M06-HU-001/002/003: objetivos por tipo; M06-HU-004: distintos por prioridad. */
export const slaPolicySchema = z.object({
  name: z.string().min(3).max(80),
  firstResponseMin: z.coerce.number().int().positive().max(10080),
  assignMin: z.coerce.number().int().positive().max(10080),
  resolveMin: z.coerce.number().int().positive().max(43200),
  priority: z.enum(['critica', 'alta', 'media', 'baja']),
});

export type SlaPolicyInput = z.infer<typeof slaPolicySchema>;

/** M08-HU-006/008: plantilla con variables del caso. */
export const templateSchema = z.object({
  code: z.string().min(3).max(40),
  subject: z.string().min(5).max(120),
  body: z.string().min(10).max(5000),
});

export type TemplateInput = z.infer<typeof templateSchema>;

/** M03-HU-001/007: servicio de catálogo con preguntas mínimas. */
export const serviceSchema = z.object({
  name: z.string().min(3).max(80),
  category: z.string().min(2).max(60),
  description: z.string().min(10).max(2000),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

/** M07-HU-023/024: decisión de aprobación con motivo en rechazo. */
export const approvalDecisionSchema = z
  .object({
    decision: z.enum(['aprobar', 'rechazar']),
    reason: z.string().max(1000).optional(),
  })
  .refine((v) => v.decision === 'aprobar' || (v.reason && v.reason.length >= 5), {
    message: 'El rechazo exige motivo (mín. 5 caracteres)',
    path: ['reason'],
  });

export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
