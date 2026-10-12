import type { ReactNode } from 'react';
import { ShieldCheck, Clock3, BarChart3 } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Trazabilidad total',
    description: 'Cada ticket con dueño, SLA y auditoría.',
  },
  {
    icon: Clock3,
    title: 'SLA bajo control',
    description: 'Colas, prioridades y vencimientos visibles.',
  },
  {
    icon: BarChart3,
    title: 'Operación medible',
    description: 'Reportes por tenant y organización.',
  },
];

/**
 * Layout de autenticación empresarial — split screen.
 * Izquierda: panel de marca (solo desktop). Derecha: formulario.
 * SRP: solo presentación; las páginas aportan el form.
 */
export function AuthLayout({
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Panel de marca */}
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand-700 px-10 py-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 300px at 20% 0%, rgba(255,255,255,0.14), transparent 60%), radial-gradient(500px 400px at 100% 100%, rgba(0,0,0,0.25), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand-700">
              N
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold">Nyuro</p>
              <p className="text-xs text-white/70">Ticket System</p>
            </div>
          </div>
          <h2 className="mt-12 max-w-md text-[28px] font-semibold leading-snug">
            Operación de soporte con trazabilidad total.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            Tenants, organizaciones, colas y SLA en una sola plataforma sobria y auditable.
          </p>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
                  <h.icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="text-[13px] text-white/70">{h.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">
          Nyuro · Plataforma multi-tenant · v1.0
        </p>
      </aside>

      {/* Columna de formulario */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Marca compacta en móvil */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
              N
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold text-ink-900">Nyuro</p>
              <p className="text-xs text-ink-500">Ticket System</p>
            </div>
          </div>

          <section className="card !rounded-xl p-6 sm:p-8">
            {badge && <div className="mb-4">{badge}</div>}
            <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </section>

          {footer && (
            <p className="mt-5 text-center text-[13px] text-ink-500">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}

/** Alerta de error empresarial para formularios auth. */
export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] leading-relaxed text-danger"
    >
      {message}
    </p>
  );
}
