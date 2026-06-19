import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/auth-context';

function HomeContent() {
  const { user, tenant, organization, logout } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAccountAdmin = user?.role === 'ACCOUNT_ADMIN';
  const isItManager = user?.role === 'IT_MANAGER';
  const isAgent = user?.role === 'AGENT';
  const isRequester = user?.role === 'REQUESTER';

  useEffect(() => {
    if (isItManager && router.pathname === '/') {
      router.replace('/it-manager/dashboard');
    } else if (isAgent && router.pathname === '/') {
      router.replace('/agent/dashboard');
    }
  }, [isItManager, isAgent, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Nyuro Ticket System</h1>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <Link
                href="/admin/tenants"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Panel Admin
              </Link>
            )}
            {isAccountAdmin && (
              <Link
                href="/tenant/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Panel Tenant
              </Link>
            )}
            {isItManager && (
              <Link
                href="/it-manager/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Panel IT Manager
              </Link>
            )}
            {isAgent && (
              <Link
                href="/agent/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Panel Agente
              </Link>
            )}
            {isRequester && (
              <Link
                href="/requester/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Mis Tickets
              </Link>
            )}
            <span className="text-sm text-gray-500">
              {user?.name} · {tenant?.name || 'Sin tenant'}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Bienvenido, {user?.name}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Has iniciado sesión como <span className="font-medium">{user?.role}</span>
          </p>
          <div className="space-y-1 text-sm text-gray-500">
            {tenant && (
              <p>
                Tenant: <span className="font-medium">{tenant.name}</span>
              </p>
            )}
            {organization && (
              <p>
                Organización: <span className="font-medium">{organization.name}</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
