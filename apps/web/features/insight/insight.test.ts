import { describe, expect, it } from 'vitest';
import {
  canStartRemoteSession,
  isDuplicateEvent,
  isLikelyDuplicateAsset,
  kbFreshness,
  shouldEscalateToHuman,
  validateFileAgainstPolicy,
} from '../support/rules';
import {
  backlogTrend,
  csat,
  filterAudit,
  prorate,
  responseRate,
  rolloutEnabled,
  slaCompliance,
} from './rules';

describe('M09/M11/M12/M13/M14/M15', () => {
  it('bloquea tipo no admitido y tamaño excesivo (M09)', () => {
    const policy = { maxMb: 10, allowedMime: ['image/png', 'application/pdf'] };
    expect(validateFileAgainstPolicy({ mime: 'application/x-msdownload', sizeMb: 1 }, policy).ok).toBe(false);
    expect(validateFileAgainstPolicy({ mime: 'image/png', sizeMb: 50 }, policy).ok).toBe(false);
    expect(validateFileAgainstPolicy({ mime: 'image/png', sizeMb: 2 }, policy).ok).toBe(true);
  });
  it('detecta duplicado de activo por serie u hostname (M11-HU-005)', () => {
    expect(isLikelyDuplicateAsset({ serial: 'S1' }, { serial: 'S1' })).toBe(true);
    expect(isLikelyDuplicateAsset({ hostname: 'h1' }, { hostname: 'h2' })).toBe(false);
  });
  it('marca KB vencida (M12-HU-032)', () => {
    expect(kbFreshness({ nextReviewIso: '2020-01-01', nowIso: '2026-01-01' })).toBe('vencido');
    expect(kbFreshness({ nextReviewIso: '2026-01-05', nowIso: '2026-01-01' })).toBe('por_revisar');
  });
  it('deriva a humano con baja confianza (M13-HU-027)', () => {
    expect(shouldEscalateToHuman(0.4)).toBe(true);
    expect(shouldEscalateToHuman(0.9)).toBe(false);
  });
  it('remoto exige autorización + dispositivo (M14)', () => {
    expect(canStartRemoteSession({ authorized: true, deviceConfirmed: false })).toBe(false);
    expect(canStartRemoteSession({ authorized: true, deviceConfirmed: true })).toBe(true);
  });
  it('evento repetido no se reprocesa (M15-HU-018)', () => {
    expect(isDuplicateEvent(['e1'], 'e1')).toBe(true);
    expect(isDuplicateEvent(['e1'], 'e2')).toBe(false);
  });
});

describe('M10/M16/M17/M18/M19', () => {
  it('auditoría filtra por actor y resultado (M10-E02)', () => {
    const rows = filterAudit(
      [
        { id: '1', at: '2026-01-01', actor: 'ana', action: 'cerrar', entity: 'NYU-1', result: 'ok' },
        { id: '2', at: '2026-01-02', actor: 'luis', action: 'asignar', entity: 'NYU-2', result: 'error' },
      ],
      { actor: 'ana' },
    );
    expect(rows).toHaveLength(1);
  });
  it('compliance y backlog (M16)', () => {
    expect(slaCompliance([{ met: true }, { met: false }])).toBe(0.5);
    expect(backlogTrend(10, 7)).toBe('crece');
  });
  it('CSAT ignora inválidas y no confunde silencio (M17)', () => {
    expect(csat([{ score: 5, valid: true }, { score: 1, valid: false }])).toEqual({ avg: 5, n: 1 });
    expect(responseRate(100, 30)).toBe(0.3);
  });
  it('prorrateo y rollout (M18/M19)', () => {
    expect(prorate(1200, 0)).toBe(1200);
    expect(rolloutEnabled(5, 10)).toBe(true);
    expect(rolloutEnabled(50, 10)).toBe(false);
  });
});
