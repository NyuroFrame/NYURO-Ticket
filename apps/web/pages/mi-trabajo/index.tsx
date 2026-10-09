import { PageHeader } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { TicketTable } from '../../features/core/TicketTable';
import { useTickets } from '../../features/core/hooks';

/** M05-HU-028: vista diaria del agente. Filtra por asignado simulado. */
function MiTrabajoContent() {
  const { user, logout } = useAuth();
  const { data } = useTickets();
  const mine = (data ?? []).filter((t) => t.assignee === 'Luis Paredes');

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Mi trabajo" description="Tickets a mi cargo y su estado de SLA." breadcrumb="Operar / Mi trabajo" />
      <TicketTable tickets={mine} />
    </AppShell>
  );
}

export default function MiTrabajoPage() {
  return (
    <ProtectedRoute>
      <MiTrabajoContent />
    </ProtectedRoute>
  );
}
