import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppShell } from '../components/enterprise/AppShell';
import { useAuth } from '../contexts/auth-context';

const ROLE_PANEL: Record<string, { href: string; label: string }> = {
  SUPER_ADMIN: { href: '/admin/tenants', label: 'Abrir Panel Admin' },
  ACCOUNT_ADMIN: { href: '/tenant/dashboard', label: 'Abrir Panel Tenant' },
  IT_MANAGER: { href: '/it-manager/dashboard', label: 'Abrir Panel IT Manager' },
  AGENT: { href: '/agent/dashboard', label: 'Abrir Panel Agente' },
  REQUESTER: { href: '/requester/dashboard', label: 'Ver Mis Tickets' },
};

function HomeContent() {
  const { user, tenant, organization, logout } = useAuth();
  const router = useRouter();
  const isItManager = user?.role === 'IT_MANAGER';
  const isAgent = user?.role === 'AGENT';

  useEffect(() => {
    if (isItManager && router.pathname === '/') {
      router.replace('/it-manager/dashboard');
    } else if (isAgent && router.pathname === '/') {
      router.replace('/agent/dashboard');
    }
  }, [isItManager, isAgent, router]);

  const panel = user ? ROLE_PANEL[user.role] : undefined;

  return (
    <AppShell role={user?.role} userName={user?.name} onLogout={logout}>
      <div className="mb-4">
        <p className="text-xs text-ink-500">Inicio</p>
        <h1 className="text-lg font-semibold text-ink-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-500">
          Has iniciado sesión como <span className="font-medium text-ink-700">{user?.role}</span>
        </p>
      </div>

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
          {tenant && (
            <span className="rounded-full border border-line bg-slate-50 px-2.5 py-1">
              Tenant: <span className="font-medium text-ink-900">{tenant.name}</span>
            </span>
          )}
          {organization && (
            <span className="rounded-full border border-line bg-slate-50 px-2.5 py-1">
              Organización: <span className="font-medium text-ink-900">{organization.name}</span>
            </span>
          )}
        </div>
        {panel && (
          <div className="mt-5">
            <Link href={panel.href} className="btn-primary">
              {panel.label}
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
