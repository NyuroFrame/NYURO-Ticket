import { describe, expect, it } from 'vitest';
import { dedupeNotifications, slaStateFor, sortBySlaUrgency } from './sla';
import { approvalDecisionSchema, slaPolicySchema, serviceSchema } from './schemas';

describe('M06 SLA', () => {
  it('pausado prevalece (M06-HU-015)', () => {
    expect(slaStateFor({ elapsedMin: 999, targetMin: 60, riskBeforeMin: 15, paused: true })).toBe('pausado');
  });
  it('riesgo antes del vencimiento (M06-HU-019/020)', () => {
    expect(slaStateFor({ elapsedMin: 50, targetMin: 60, riskBeforeMin: 15, paused: false })).toBe('en_riesgo');
    expect(slaStateFor({ elapsedMin: 61, targetMin: 60, riskBeforeMin: 15, paused: false })).toBe('vencido');
  });
  it('bandeja ordena vencidos primero (M06-HU-030)', () => {
    const rows = sortBySlaUrgency([{ sla: 'ok' as const }, { sla: 'vencido' as const }, { sla: 'en_riesgo' as const }]);
    expect(rows.map((r) => r.sla)).toEqual(['vencido', 'en_riesgo', 'ok']);
  });
  it('política exige tiempos positivos', () => {
    expect(slaPolicySchema.safeParse({ name: 'Std', firstResponseMin: 0, assignMin: 30, resolveMin: 240, priority: 'alta' }).success).toBe(false);
  });
});

describe('M08 notificaciones', () => {
  it('colapsa duplicados por tipo+ref (M08-HU-016)', () => {
    const rows = dedupeNotifications([
      { kind: 'sla_riesgo', ref: 'NYU-1' },
      { kind: 'sla_riesgo', ref: 'NYU-1' },
      { kind: 'asignacion', ref: 'NYU-1' },
    ]);
    expect(rows).toHaveLength(2);
  });
});

describe('M03 catálogo / M07 aprobaciones', () => {
  it('servicio exige descripción (M03-HU-003)', () => {
    expect(serviceSchema.safeParse({ name: 'VPN', category: 'Accesos', description: 'x' }).success).toBe(false);
  });
  it('rechazo exige motivo (M07-HU-024)', () => {
    expect(approvalDecisionSchema.safeParse({ decision: 'rechazar', reason: 'x' }).success).toBe(false);
    expect(approvalDecisionSchema.safeParse({ decision: 'rechazar', reason: 'Sin presupuesto este trimestre' }).success).toBe(true);
    expect(approvalDecisionSchema.safeParse({ decision: 'aprobar' }).success).toBe(true);
  });
});
