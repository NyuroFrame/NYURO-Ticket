import { useState, useEffect } from 'react';
import { AdminRoute } from '../../components/AdminRoute';
import { useAuth } from '../../contexts/auth-context';
import { useTenants, type CreateTenantData, type UpdateTenantData, type CreateTenantWithOwnerData } from '../../hooks/useTenants';

interface TenantFormData {
  tenantName: string;
  tenantSlug: string;
  isActive: boolean;
  ownerName: string;
}

const emptyForm: TenantFormData = {
  tenantName: '',
  tenantSlug: '',
  isActive: true,
  ownerName: '',
};

function TenantsAdminContent() {
  const { logout } = useAuth();
  const { tenants, loading, error, fetchTenants, createTenant, createTenantWithOwner, updateTenant, deleteTenant } = useTenants();
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<{ id: string; name: string; slug: string; isActive: boolean } | null>(null);
  const [form, setForm] = useState<TenantFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    tenantName: string;
    ownerName: string;
    tempPassword: string;
  } | null>(null);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const openCreate = () => {
    setEditingTenant(null);
    setForm(emptyForm);
    setFormError(null);
    setCreatedResult(null);
    setShowModal(true);
  };

  const openEdit = (tenant: typeof tenants[0]) => {
    setEditingTenant(tenant);
    setForm({
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      isActive: tenant.isActive,
      ownerName: '',
    });
    setFormError(null);
    setCreatedResult(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!form.tenantName.trim()) {
      setFormError('El nombre del tenant es requerido');
      setSubmitting(false);
      return;
    }

    let result;
    if (editingTenant) {
      const data: UpdateTenantData = {};
      if (form.tenantName !== editingTenant.name) data.name = form.tenantName;
      if (form.tenantSlug !== editingTenant.slug) data.slug = form.tenantSlug;
      if (form.isActive !== editingTenant.isActive) data.isActive = form.isActive;

      if (Object.keys(data).length === 0) {
        setShowModal(false);
        setSubmitting(false);
        return;
      }

      result = await updateTenant(editingTenant.id, data);
    } else {
      if (!form.ownerName.trim()) {
        setFormError('El nombre de usuario del owner es requerido');
        setSubmitting(false);
        return;
      }

      const data: CreateTenantWithOwnerData = {
        tenantName: form.tenantName,
        tenantSlug: form.tenantSlug || undefined,
        isActive: form.isActive,
        ownerName: form.ownerName,
      };
      result = await createTenantWithOwner(data);

      if (result.success && result.data) {
        setCreatedResult({
          tenantName: result.data.tenant.name,
          ownerName: result.data.owner.name,
          tempPassword: result.data.tempPassword,
        });
        setForm(emptyForm);
        setSubmitting(false);
        return;
      }
    }

    if (result.success) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el tenant "${name}"?`)) return;
    await deleteTenant(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <span className="text-sm text-gray-500">Tenants</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Nuevo Tenant
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && tenants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay tenants registrados
                    </td>
                  </tr>
                )}
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{tenant.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          tenant.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tenant.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(tenant)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id, tenant.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTenant ? 'Editar Tenant' : 'Nuevo Tenant'}
              </h2>
            </div>

            {createdResult ? (
              <div className="px-6 py-6 space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Tenant creado exitosamente</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <p><span className="font-medium">Tenant:</span> {createdResult.tenantName}</p>
                    <p><span className="font-medium">Usuario:</span> {createdResult.ownerName}</p>
                    <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Contraseña temporal (copia y comparte con el usuario):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-900 break-all">
                          {createdResult.tempPassword}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(createdResult.tempPassword)}
                          className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCreatedResult(null);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Tenant *
                  </label>
                  <input
                    type="text"
                    value={form.tenantName}
                    onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Acme Corporation"
                    disabled={!!editingTenant}
                  />
                </div>

                {!editingTenant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de usuario del Owner *
                    </label>
                    <input
                      type="text"
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: juan.perez@acme.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este será el usuario con rol ACCOUNT_ADMIN para gestionar el tenant.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.tenantSlug}
                    onChange={(e) => setForm({ ...form, tenantSlug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Se genera automáticamente del nombre"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si se deja vacío, se genera automáticamente del nombre.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Activo
                  </label>
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
                    {submitting ? 'Guardando...' : editingTenant ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenantsAdminPage() {
  return (
    <AdminRoute>
      <TenantsAdminContent />
    </AdminRoute>
  );
}
