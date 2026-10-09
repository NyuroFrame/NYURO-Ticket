import { PageHeader, EmptyState, Button } from '@nyuro/ui';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { TicketTable } from '../../features/core/TicketTable';
import { useTickets } from '../../features/core/hooks';

/** M04-E01/E03 + M05-E06: bandeja de tickets con responsable y estado. */
function TicketsContent() {
  const { user, logout } = useAuth();
  const { data, isLoading } = useTickets();

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader
        title="Tickets"
        description="Ciclo de vida del caso: registro, clasificación, estado y resolución (M04)."
        breadcrumb="Operar / Tickets"
        actions={
          <Link href="/tickets/nuevo" className="btn-primary">
            Nuevo ticket
          </Link>
        }
      />
      {isLoading && <p className="text-sm text-ink-500">Cargando casos…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <EmptyState
          title="Sin tickets en este contexto"
          description="Cambia de tenant u organización, o registra el primer caso."
          action={
            <Link href="/tickets/nuevo" className="btn-secondary">
              Registrar caso
            </Link>
          }
        />
      )}
      {!isLoading && data && data.length > 0 && <TicketTable tickets={data} />}
    </AppShell>
  );
}

export default function TicketsPage() {
  return (
    <ProtectedRoute>
      <TicketsContent />
    </ProtectedRoute>
  );
}
