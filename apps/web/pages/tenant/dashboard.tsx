import Link from 'next/link';
import { TenantRoute } from '../../components/TenantRoute';
import { useAuth } from '../../contexts/auth-context';

function TenantDashboardContent() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Nyuro Ticket System
            </Link>
            <span className="text-sm text-gray-500">Panel Tenant</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name} · {tenant?.name || 'Sin tenant'}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Panel de administración del tenant
          </h2>

          {tenant ? (
            <div className="space-y-6 text-sm text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Slug</p>
                  <p className="font-medium text-gray-900">{tenant.slug}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Usuario</p>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rol</p>
                  <p className="font-medium text-gray-900">{user?.role}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Gestión</h3>
                <Link
                  href="/tenant/organizations"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Gestionar organizaciones
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No se encontro informacion del tenant.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TenantDashboardPage() {
  return (
    <TenantRoute>
      <TenantDashboardContent />
    </TenantRoute>
  );
}
