import { PageHeader, Card } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { mockApprovals, mockNotifications, mockServices } from '../../features/ops/mocks';
import { dedupeNotifications } from '../../features/ops/sla';

/** M08 bandeja + M03 catálogo + M07 aprobaciones en una vista operativa F2. */
function OpsContent() {
  const { user, logout } = useAuth();
  const notes = dedupeNotifications(mockNotifications);
  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Operación diaria" description="Notificaciones sin duplicados (M08), catálogo (M03) y aprobaciones (M07)." breadcrumb="Operar / Tablero" />
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Notificaciones" subtitle={`${notes.length} relevantes`}>
          <ul className="space-y-2 text-[13px]">
            {notes.map((n) => (
              <li key={n.id} className="flex justify-between gap-2 border-b border-line pb-2">
                <span>{n.text}</span>
                <span className="text-ink-400">{n.read ? 'leída' : 'nueva'}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Aprobaciones pendientes" subtitle="M07-E04: con contexto antes de decidir">
          <ul className="space-y-2 text-[13px]">
            {mockApprovals.map((a) => (
              <li key={a.id} className="border-b border-line pb-2">
                <span className="font-medium">{a.service}</span> · {a.requester} · paso: {a.step}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card title="Catálogo de servicios" subtitle="M03-E03: lo que puedes solicitar según tu contexto" className="mt-3">
        <div className="grid gap-2 md:grid-cols-3">
          {mockServices.map((s) => (
            <div key={s.id} className="rounded-md border border-line p-3">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-ink-500">{s.category}</p>
              <p className="mt-1 text-[13px] text-ink-700">{s.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

function OpsPage() {
  return (
    <ProtectedRoute>
      <OpsContent />
    </ProtectedRoute>
  );
}

export default OpsPage;
