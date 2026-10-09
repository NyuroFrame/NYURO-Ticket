/**
 * M06: cálculo puro de estado SLA (testeable, sin fechas del sistema).
 * Distingue transcurrido vs efectivo (M06-HU-017) vía `pausedMin`.
 */
export type SlaState = 'ok' | 'en_riesgo' | 'vencido' | 'pausado';

export function slaStateFor(opts: {
  elapsedMin: number;
  targetMin: number;
  riskBeforeMin: number;
  paused: boolean;
}): SlaState {
  if (opts.paused) return 'pausado';
  const remaining = opts.targetMin - opts.elapsedMin;
  if (remaining <= 0) return 'vencido';
  if (remaining <= opts.riskBeforeMin) return 'en_riesgo';
  return 'ok';
}

/** M06-HU-019/022: prioriza riesgo sobre vencido para la bandeja. */
export function sortBySlaUrgency<T extends { sla: SlaState }>(rows: T[]): T[] {
  const rank: Record<SlaState, number> = { vencido: 0, en_riesgo: 1, ok: 2, pausado: 3 };
  return [...rows].sort((a, b) => rank[a.sla] - rank[b.sla]);
}

/** M08-HU-016: deduplica por (tipo + ref) antes de mostrar la campana. */
export function dedupeNotifications<T extends { kind: string; ref: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = `${r.kind}:${r.ref}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
