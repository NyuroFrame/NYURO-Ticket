import { create } from 'zustand';

/**
 * Tenant activo (M01-E04): elegir / saber / cambiar sin arrastrar contexto.
 * SRP: solo tenant + org + unidad activas. El resto vive en TanStack Query.
 */
interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  organizationId: string | null;
  orgUnitId: string | null;
  /** Cambiar de cliente limpia el contexto anterior (M01-HU-020). */
  setActiveContext: (ctx: {
    tenantId: string;
    tenantName?: string | null;
    organizationId?: string | null;
    orgUnitId?: string | null;
  }) => void;
  clear: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: null,
  tenantName: null,
  organizationId: null,
  orgUnitId: null,
  setActiveContext: (ctx) =>
    set({
      tenantId: ctx.tenantId,
      tenantName: ctx.tenantName ?? null,
      organizationId: ctx.organizationId ?? null,
      orgUnitId: ctx.orgUnitId ?? null,
    }),
  clear: () => set({ tenantId: null, tenantName: null, organizationId: null, orgUnitId: null }),
}));

/** Selector liviano para el header HTTP. Evita suscripciones innecesarias. */
export function getActiveTenantId(): string | null {
  return useTenantStore.getState().tenantId;
}
