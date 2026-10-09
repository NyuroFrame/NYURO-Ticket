import { PageHeader, Card, Badge } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { filterAudit } from '../../features/insight/rules';
import { backlogTrend, csat, slaCompliance } from '../../features/insight/rules';

const AUDIT = [
  { id: '1', at: '2026-10-01', actor: 'luis.p', action: 'asignar', entity: 'NYU-1042', result: 'ok' as const },
  { id: '2', at: '2026-10-02', actor: 'ana.t', action: 'reabrir', entity: 'NYU-1040', result: 'ok' as const },
];

function GobiernoContent() {
  const { user, logout } = useAuth();
  const compliance = slaCompliance([{ met: true }, { met: true }, { met: false }]);
  const trend = backlogTrend(12, 9);
  const s = csat([{ score: 5, valid: true }, { score: 4, valid: true }, { score: 2, valid: false }]);
  const events = filterAudit(AUDIT, {});

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Gobierno y análisis" description="Auditoría (M10), reporting (M16) y experiencia (M17). Solo lectura." breadcrumb="Analizar / Gobierno" />
      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Cumplimiento SLA" subtitle="M16-HU-009"><p className="tnum text-2xl font-semibold">{Math.round(compliance * 100)}%</p></Card>
        <Card title="Backlog" subtitle="Creados vs resueltos"><p className="text-2xl font-semibold">{trend}</p></Card>
        <Card title="CSAT" subtitle={`${s.n} respuestas válidas`}><p className="tnum text-2xl font-semibold">{s.avg.toFixed(1)}</p></Card>
      </div>
      <Card title="Auditoría reciente" subtitle="Quién, cuándo, sobre qué y resultado (M10-E01)" className="mt-3">
        <table className="table-dense w-full">
          <thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Entidad</th><th>Resultado</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}><td className="tnum">{e.at}</td><td>{e.actor}</td><td>{e.action}</td><td className="ref-mono">{e.entity}</td><td><Badge tone={e.result === 'ok' ? 'success' : 'danger'}>{e.result}</Badge></td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

export default function GobiernoPage() {
  return (
    <ProtectedRoute>
      <GobiernoContent />
    </ProtectedRoute>
  );
}
