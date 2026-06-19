import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TenantRoute } from '../../components/TenantRoute';
import { useAuth } from '../../contexts/auth-context';
import { useOrganizations, type CreateOrganizationData, type UpdateOrganizationData } from '../../hooks/useOrganizations';
import { useUsers } from '../../hooks/useUsers';
import { PasswordInput } from '../../components/PasswordInput';

interface OrganizationFormData {
  name: string;
  slug: string;
  code: string;
  isActive: boolean;
}

const emptyForm: OrganizationFormData = {
  name: '',
  slug: '',
  code: '',
  isActive: true,
};

interface ItManagerFormData {
  name: string;
  password: string;
  organizationId: string;
}

const emptyItManagerForm: ItManagerFormData = {
  name: '',
  password: '',
  organizationId: '',
};

function OrganizationsContent() {
  const { user, tenant, logout } = useAuth();
  const {
    organizations,
    loading,
    error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  } = useOrganizations();
  const { error: userError, createItManager } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [showItManagerModal, setShowItManagerModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<{
    id: string;
    name: string;
    slug: string;
    code: string;
    isActive: boolean;
  } | null>(null);
  const [form, setForm] = useState<OrganizationFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [itManagerForm, setItManagerForm] = useState<ItManagerFormData>(emptyItManagerForm);
  const [itManagerFormError, setItManagerFormError] = useState<string | null>(null);
  const [itManagerSubmitting, setItManagerSubmitting] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      fetchOrganizations(tenant.id);
    }
  }, [tenant?.id, fetchOrganizations]);

  const openCreate = () => {
    setEditingOrg(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (org: typeof organizations[0]) => {
    setEditingOrg(org);
    setForm({
      name: org.name,
      slug: org.slug,
      code: org.code,
      isActive: org.isActive,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!tenant?.id) {
      setFormError('No se encontro el tenant');
      return;
    }

    if (!form.name.trim()) {
      setFormError('El nombre de la organizacion es requerido');
      return;
    }

    setSubmitting(true);

    let result;
    if (editingOrg) {
      const data: UpdateOrganizationData = {};
      if (form.name !== editingOrg.name) data.name = form.name;
      if (form.slug !== editingOrg.slug) data.slug = form.slug;
      if (form.code !== editingOrg.code) data.code = form.code;
      if (form.isActive !== editingOrg.isActive) data.isActive = form.isActive;

      if (Object.keys(data).length === 0) {
        setShowModal(false);
        setSubmitting(false);
        return;
      }

      result = await updateOrganization(tenant.id, editingOrg.id, data);
    } else {
      const data: CreateOrganizationData = {
        name: form.name,
        slug: form.slug || undefined,
      };
      result = await createOrganization(tenant.id, data);
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
    if (!tenant?.id) return;
    if (!confirm(`Estas seguro de eliminar la organizacion "${name}"?`)) return;
    await deleteOrganization(tenant.id, id);
  };

  const openCreateItManager = (org: typeof organizations[0]) => {
    setItManagerForm({ ...emptyItManagerForm, organizationId: org.id });
    setItManagerFormError(null);
    setShowItManagerModal(true);
  };

  const handleCreateItManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setItManagerFormError(null);

    if (!itManagerForm.name.trim()) {
      setItManagerFormError('El nombre es requerido');
      return;
    }
    if (!itManagerForm.password || itManagerForm.password.length < 6) {
      setItManagerFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setItManagerSubmitting(true);
    const result = await createItManager({
      name: itManagerForm.name,
      password: itManagerForm.password,
      organizationId: itManagerForm.organizationId,
    });
    if (result.success) {
      setShowItManagerModal(false);
      setItManagerForm(emptyItManagerForm);
    } else {
      setItManagerFormError(result.error);
    }
    setItManagerSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/tenant/dashboard"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Nyuro Ticket System
            </Link>
            <span className="text-sm text-gray-500">Organizaciones</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name} · {tenant?.name || 'Sin tenant'}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Organizaciones</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nueva Organizacion
          </button>
        </div>

        {(error || formError || userError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error || formError || userError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && organizations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && organizations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No hay organizaciones registradas
                    </td>
                  </tr>
                )}
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{org.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{org.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{org.code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          org.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {org.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openCreateItManager(org)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Crear IT Manager
                        </button>
                        <button
                          onClick={() => openEdit(org)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(org.id, org.name)}
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
                {editingOrg ? 'Editar Organizacion' : 'Nueva Organizacion'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Sede Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug {editingOrg ? '' : '(opcional)'}
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={editingOrg ? '' : 'Se genera automaticamente del nombre'}
                />
              </div>

              {editingOrg && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codigo
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Codigo de la organizacion"
                  />
                </div>
              )}

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
                  {submitting ? 'Guardando...' : editingOrg ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showItManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Crear IT Manager</h2>
            </div>
            <form onSubmit={handleCreateItManager} className="px-6 py-4 space-y-4">
              {itManagerFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {itManagerFormError}
                </div>
              )}
              <input type="hidden" value={itManagerForm.organizationId} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={itManagerForm.name}
                  onChange={(e) => setItManagerForm({ ...itManagerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: jefe.ti"
                />
              </div>
              <PasswordInput
                label="Contraseña *"
                id="itManagerPassword"
                value={itManagerForm.password}
                onChange={(e) => setItManagerForm({ ...itManagerForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItManagerModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={itManagerSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {itManagerSubmitting ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <TenantRoute>
      <OrganizationsContent />
    </TenantRoute>
  );
}
