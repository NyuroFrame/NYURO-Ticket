import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, Card, Button } from '@nyuro/ui';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppShell } from '../../components/enterprise/AppShell';
import { useAuth } from '../../contexts/auth-context';
import { ticketCreateSchema, type TicketCreateInput } from '../../features/core/schemas';
import { mockOrgUnits } from '../../lib/mocks';

/** M04-HU-001/002: reportar problema con contexto organizacional (M01). */
function NuevoTicketContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketCreateInput>({ resolver: zodResolver(ticketCreateSchema) });

  const onSubmit = async (values: TicketCreateInput) => {
    // F1: persistencia local simulada; el POST real llega con apps/api.
    const ref = `NYU-${Math.floor(1000 + Math.random() * 9000)}`;
    setSaved(ref);
    void values;
  };

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <PageHeader title="Nuevo ticket" description="Describe el problema con información suficiente para el diagnóstico." breadcrumb="Operar / Tickets / Nuevo" />
      <Card title="Datos del caso" subtitle="La referencia se genera al guardar (M04-HU-004).">
        {saved ? (
          <div>
            <p className="text-sm text-ink-900">
              Ticket <span className="ref-mono font-semibold">{saved}</span> registrado.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/tickets')}>
                Volver a la bandeja
              </Button>
              <Button variant="primary" onClick={() => setSaved(null)}>
                Registrar otro
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="title">Título</label>
              <input id="title" className="input" placeholder="Ej. No funciona el correo corporativo" {...register('title')} />
              {errors.title && <p className="mt-1 text-[13px] text-danger">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="orgUnitId">Unidad organizacional</label>
              <select id="orgUnitId" className="input" {...register('orgUnitId')}>
                <option value="">Selecciona…</option>
                {mockOrgUnits.filter((u) => u.active).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {errors.orgUnitId && <p className="mt-1 text-[13px] text-danger">{errors.orgUnitId.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="description">Descripción</label>
              <textarea id="description" rows={5} className="input" placeholder="Qué ocurre, cuándo empezó, mensajes de error…" {...register('description')} />
              {errors.description && <p className="mt-1 text-[13px] text-danger">{errors.description.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Registrar ticket'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/tickets')}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Card>
    </AppShell>
  );
}

export default function NuevoTicketPage() {
  return (
    <ProtectedRoute>
      <NuevoTicketContent />
    </ProtectedRoute>
  );
}
