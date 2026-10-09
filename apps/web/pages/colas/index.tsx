import { PageHeader, Card } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { TicketTable } from '../../features/core/TicketTable';
import { useQueues, useTickets } from '../../features/core/hooks';

/** M05-E01/E06 + M04: colas por equipo y trabajo diario del agente. */
function ColasContent() {
  const { user, logout } = useAuth();
  const { data: tickets } = useTickets();
  const { data: queues } = useQueues();
  const mine = (tickets ?? []).filter((t) => t.assignee !== null);
  const unassigned = (tickets ?? []).filter((t) => t.assignee === null);

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader
        title="Colas y operación"
        description="Distribución del trabajo por equipos sin contaminar el dominio del ticket (M05)."
        breadcrumb="Operar / Colas"
      />
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        {(queues ?? []).map((q) => (
          <Card key={q.id} title={q.name} subtitle={`Equipo ${q.team}`}>
            <p className="tnum text-2xl font-semibold">{q.pending}</p>
            <p className="text-[13px] text-ink-500">pendientes de asignación</p>
          </Card>
        ))}
      </div>
      <h2 className="mb-2 text-sm font-semibold">Sin responsable ({unassigned.length})</h2>
      <TicketTable tickets={unassigned} />
      <h2 className="mb-2 mt-5 text-sm font-semibold">En atención ({mine.length})</h2>
      <TicketTable tickets={mine} />
    </AppShell>
  );
}

export default function ColasPage() {
  return (
    <ProtectedRoute>
      <ColasContent />
    </ProtectedRoute>
  );
}
