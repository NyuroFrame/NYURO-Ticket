import { PageHeader, Card } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { prorate, rolloutEnabled } from '../../features/insight/rules';

function NegocioContent() {
  const { user, logout } = useAuth();
  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Cuenta y plataforma" description="Suscripción y consumo (M18) + provisioning y salud (M19). Billing determina lo contratado; plataforma lo provisiona." breadcrumb="Cuenta / Suscripción" />
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Suscripción actual" subtitle="Plan Pro · ciclo anual">
          <p className="text-[13px]">Prorrateo de upgrade a mitad de año: <span className="tnum font-semibold">${prorate(1200, 180)}</span></p>
          <p className="mt-1 text-[13px] text-ink-500">Consumo: 812 / 1.000 tickets · 3 / 5 gateways</p>
        </Card>
        <Card title="Salud de plataforma" subtitle="M19-E04: componente afectado, no contenido del tenant">
          <ul className="text-[13px]">
            <li>API — operativa</li>
            <li>Colas — operativa</li>
            <li>Proveedor IA — degradado {rolloutEnabled(5, 10) ? '(canal 10% activo)' : ''}</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

export default function NegocioPage() {
  return (
    <ProtectedRoute>
      <NegocioContent />
    </ProtectedRoute>
  );
}
