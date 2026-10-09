import { z } from 'zod';

/** M09-HU-019/020: límites configurables; M09-HU-021: bloqueo por riesgo. */
export const filePolicySchema = z.object({
  maxMb: z.coerce.number().int().positive().max(1024),
  allowedMime: z.array(z.string().min(3)).min(1, 'Define al menos un tipo permitido'),
});

export function validateFileAgainstPolicy(
  file: { mime: string; sizeMb: number },
  policy: { maxMb: number; allowedMime: string[] },
): { ok: boolean; reason?: string } {
  if (!policy.allowedMime.includes(file.mime)) return { ok: false, reason: `Tipo no admitido: ${file.mime}` };
  if (file.sizeMb > policy.maxMb) return { ok: false, reason: `Excede ${policy.maxMb} MB` };
  return { ok: true };
}

/** M11-HU-005: detección de posible duplicado por identificadores. */
export function isLikelyDuplicateAsset(
  candidate: { serial?: string; hostname?: string },
  existing: { serial?: string; hostname?: string },
): boolean {
  if (candidate.serial && candidate.serial === existing.serial) return true;
  if (candidate.hostname && candidate.hostname === existing.hostname) return true;
  return false;
}

/** M12-HU-030/032: vigencia de artículo (revisión vencida → usar con precaución). */
export function kbFreshness(args: { nextReviewIso: string; nowIso?: string }): 'vigente' | 'por_revisar' | 'vencido' {
  const now = new Date(args.nowIso ?? new Date().toISOString()).getTime();
  const next = new Date(args.nextReviewIso).getTime();
  const days = (next - now) / 86_400_000;
  if (days < 0) return 'vencido';
  if (days <= 14) return 'por_revisar';
  return 'vigente';
}

/** M13-HU-024/027: confianza mínima para continuar sin derivar. */
export function shouldEscalateToHuman(confidence: number, threshold = 0.6): boolean {
  return confidence < threshold;
}

/** M14: la sesión solo inicia autorizada y con dispositivo confirmado. */
export function canStartRemoteSession(args: { authorized: boolean; deviceConfirmed: boolean }): boolean {
  return args.authorized && args.deviceConfirmed;
}

/** M15-HU-018: idempotencia de eventos (reintento no duplica). */
export function isDuplicateEvent(seenIds: Set<string> | string[], eventId: string): boolean {
  return Array.isArray(seenIds) ? seenIds.includes(eventId) : seenIds.has(eventId);
}
