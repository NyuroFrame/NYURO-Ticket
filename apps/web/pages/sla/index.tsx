import { Badge, toneForSla } from '@nyuro/ui';
import { PageHeader, Card } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { mockSlaRisk } from '../../features/ops/mocks';
import { sortBySlaUrgency } from '../../features/ops/sla';

/** M06-E04/E06: riesgo e incumplimiento con objetivo específico visible. */
function SlaContent() {
  const { user, logout } = useAuth();
  const rows = sortBySlaUrgency(mockSlaRisk);
  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="SLA y escalamientos" description="Tiempo restante por objetivo, riesgo y vencidos (M06)." breadcrumb="Operar / SLA" />
      <Card title="Bandeja de riesgo" subtitle="Ordenada por urgencia: vencido → en riesgo → ok.">
        <table className="table-dense w-full">
          <thead>
            <tr><th>Ref</th><th>Caso</th><th>Objetivo</th><th>Restante</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ref} className="hover:bg-slate-50">
                <td className="ref-mono">{r.ref}</td>
                <td>{r.title}</td>
                <td>{r.objective.replace('_', ' ')}</td>
                <td className="tnum">{r.remainingMin} min</td>
                <td><Badge tone={toneForSla(r.sla)}>{r.sla.replace('_', ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

export default function SlaPage() {
  return (
    <ProtectedRoute>
      <SlaContent />
    </ProtectedRoute>
  );
}
