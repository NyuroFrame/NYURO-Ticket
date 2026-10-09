import { PageHeader, Card } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { OrgTree } from '../../features/core/OrgTree';
import { useOrgUnits } from '../../features/core/hooks';

/** M01-E01/E05: estructura y contexto organizacional para soporte. */
function UnidadesContent() {
  const { user, logout } = useAuth();
  const { data, isLoading } = useOrgUnits();
  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader
        title="Organización"
        description="Unidades, dependencia y terminología propia (M01-HU-002/003). Las inactivas conservan historial."
        breadcrumb="Gestionar / Organización"
      />
      {isLoading && <p className="text-sm text-ink-500">Cargando estructura…</p>}
      {data && <OrgTree units={data} />}
      <Card title="Regla de negocio" subtitle="M01-HU-007/011" className="mt-4">
        <p className="text-[13px] text-ink-700">
          Desactivar una unidad o mover a un usuario nunca reescribe tickets anteriores: el ticket
          conserva el contexto con el que fue creado (M04-HU-011).
        </p>
      </Card>
    </AppShell>
  );
}

export default function UnidadesPage() {
  return (
    <ProtectedRoute>
      <UnidadesContent />
    </ProtectedRoute>
  );
}
