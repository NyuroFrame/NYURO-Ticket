import { useState } from 'react';
import Link from 'next/link';
import { TenantRoute } from '../../components/TenantRoute';
import { useAuth } from '../../contexts/auth-context';
import { useUsers } from '../../hooks/useUsers';

function TenantDashboardContent() {
  const { user, tenant, logout } = useAuth();
  const { users, loading, error, createItManager } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', organizationId: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('El nombre es requerido');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!form.organizationId.trim()) {
      setFormError('El ID de organización es requerido');
      return;
    }

    setSubmitting(true);
    const result = await createItManager({ name: form.name, password: form.password, organizationId: form.organizationId });
    if (result.success) {
      setShowModal(false);
      setForm({ name: '', password: '', organizationId: '' });
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

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
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/tenant/organizations"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Gestionar organizaciones
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Crear IT Manager
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No se encontro informacion del tenant.</p>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Crear IT Manager</h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: jefe.ti"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Organización *</label>
                <input
                  type="text"
                  value={form.organizationId}
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ID de la organización"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
