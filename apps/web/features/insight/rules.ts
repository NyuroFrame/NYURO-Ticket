/** M10: auditoría inmutable — sin setters, solo append + filtros puros. */
export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  result: 'ok' | 'rechazado' | 'error';
}

export function filterAudit(events: AuditEvent[], q: { actor?: string; result?: AuditEvent['result']; from?: string; to?: string }): AuditEvent[] {
  return events.filter((e) => {
    if (q.actor && e.actor !== q.actor) return false;
    if (q.result && e.result !== q.result) return false;
    if (q.from && e.at < q.from) return false;
    if (q.to && e.at > q.to) return false;
    return true;
  });
}

/** M16: agregados puros para dashboard (no mutan dominios). */
export function slaCompliance(rows: { met: boolean }[]): number {
  if (rows.length === 0) return 0;
  return rows.filter((r) => r.met).length / rows.length;
}

export function backlogTrend(created: number, resolved: number): 'crece' | 'baja' | 'estable' {
  if (created > resolved) return 'crece';
  if (resolved > created) return 'baja';
  return 'estable';
}

/** M17: CSAT + tasa de respuesta; M17-HU-026: no-respuesta ≠ insatisfacción. */
export function csat(rows: { score: number; valid: boolean }[]): { avg: number; n: number } {
  const valid = rows.filter((r) => r.valid);
  if (valid.length === 0) return { avg: 0, n: 0 };
  return { avg: valid.reduce((a, r) => a + r.score, 0) / valid.length, n: valid.length };
}

export function responseRate(asked: number, answered: number): number {
  if (asked === 0) return 0;
  return answered / asked;
}

/** M18: prorrateo lineal simple para upgrade a mitad de ciclo. */
export function prorate(annualPrice: number, daysUsed: number, daysTotal = 365): number {
  return Math.round(((annualPrice * (daysTotal - daysUsed)) / daysTotal) * 100) / 100;
}

/** M19: rollout progresivo — porcentaje de tenants habilitados. */
export function rolloutEnabled(tenantIndex: number, percent: number): boolean {
  return tenantIndex % 100 < percent;
}
