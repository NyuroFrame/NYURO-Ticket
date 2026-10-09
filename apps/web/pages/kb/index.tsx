import { PageHeader, Card, Badge } from '@nyuro/ui';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { kbFreshness } from '../../features/support/rules';

const ASSETS = [
  { id: 'LT-101', name: 'Laptop ThinkPad', user: 'Ana Torres', sede: 'Lima', tickets: 3 },
  { id: 'SV-02', name: 'Servidor NAS', user: 'Infraestructura', sede: 'Lima', tickets: 1 },
];
const KB = [
  { slug: 'vpn-acceso', title: 'Solicitar acceso VPN', nextReview: '2026-11-01', audience: 'usuarios' },
  { slug: 'correo-500', title: 'Error 500 en correo', nextReview: '2025-01-01', audience: 'interno' },
];

function SoporteContent() {
  const { user, logout } = useAuth();
  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Soporte técnico" description="Activos (M11), conocimiento (M12), IA con derivación (M13) y remoto con consentimiento (M14)." breadcrumb="Ayuda / Soporte" />
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Activos con incidencias" subtitle="M11-HU-030/036">
          <ul className="space-y-2 text-[13px]">
            {ASSETS.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-line pb-2">
                <span><span className="ref-mono font-medium">{a.id}</span> · {a.name} · {a.user}</span>
                <Badge tone={a.tickets >= 3 ? 'warning' : 'neutral'}>{a.tickets} tickets</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Base de conocimiento" subtitle="M12: vigente vs vencido">
          <ul className="space-y-2 text-[13px]">
            {KB.map((k) => {
              const f = kbFreshness({ nextReviewIso: k.nextReview, nowIso: '2026-10-09' });
              return (
                <li key={k.slug} className="flex justify-between border-b border-line pb-2">
                  <span>{k.title} <span className="text-ink-400">· {k.audience}</span></span>
                  <Badge tone={f === 'vigente' ? 'success' : f === 'por_revisar' ? 'warning' : 'danger'}>{f}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      <Card title="Asistencia IA (contingencia)" subtitle="M13: sugerencia con confianza y derivación humana siempre disponible" className="mt-3">
        <p className="text-[13px] text-ink-700">
          Sugerencia: categoría <strong>Correo</strong> · prioridad <strong>alta</strong> ·
          confianza <span className="tnum">0.42</span> → <strong>derivar a humano</strong> (umbral 0.60).
          El ticket sigue operable sin IA.
        </p>
      </Card>
    </AppShell>
  );
}

export default function SoportePage() {
  return (
    <ProtectedRoute>
      <SoporteContent />
    </ProtectedRoute>
  );
}
