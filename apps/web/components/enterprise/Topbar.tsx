import { Bell } from 'lucide-react';
import { useTenantStore } from '../../lib/tenant-store';

/**
 * Topbar: tenant activo siempre visible (M01-HU-019) + contexto org.
 * SRP: presentación del contexto; el cambio real lo orquesta cada página.
 */
export function Topbar({
  userName,
  onLogout,
  pendingNotifications = 0,
}: {
  userName?: string;
  onLogout?: () => void;
  pendingNotifications?: number;
}) {
  const { tenantName, organizationId } = useTenantStore();
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-line bg-white px-4">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="truncate font-medium text-ink-900">{tenantName ?? 'Sin tenant activo'}</span>
        {organizationId && (
          <span className="hidden truncate text-ink-500 sm:inline">· {organizationId}</span>
        )}
        <span className="rounded border border-line bg-slate-50 px-1.5 py-0.5 text-[11px] text-ink-500">
          M01 contexto
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-md border border-line p-1.5 text-ink-700 hover:bg-slate-50"
        >
          <Bell size={16} />
          {pendingNotifications > 0 && (
            <span className="tnum absolute -right-1 -top-1 rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {pendingNotifications}
            </span>
          )}
        </button>
        <span className="hidden text-[13px] text-ink-500 sm:inline">{userName}</span>
        {onLogout && (
          <button type="button" onClick={onLogout} className="btn-secondary !px-2.5 !py-1.5 text-[13px]">
            Salir
          </button>
        )}
      </div>
    </header>
  );
}
