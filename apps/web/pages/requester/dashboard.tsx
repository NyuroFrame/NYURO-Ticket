import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/auth-context';
import { useTickets } from '../../hooks/useTickets';

function RequesterDashboardContent() {
  const { user, orgUnit, logout } = useAuth();
  const { tickets, loading, error, fetchMyTickets, createTicket } = useTickets();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('El título es requerido');
      return;
    }
    if (!form.description.trim()) {
      setFormError('La descripción es requerida');
      return;
    }

    setSubmitting(true);
    const result = await createTicket({
      title: form.title,
      description: form.description,
      priority: form.priority,
    });
    if (result.success) {
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'MEDIUM' });
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Panel de Solicitante</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name} · {orgUnit?.name || 'Sin área'}</span>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mis Tickets</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nuevo Ticket
          </button>
        </div>

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                  </tr>
                )}
                {!loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No has creado tickets</td>
                  </tr>
                )}
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.priority}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.orgUnit?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.assignee?.name || 'Sin asignar'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</td>
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
              <h2 className="text-lg font-semibold text-gray-900">Nuevo Ticket</h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Problema con impresora"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe el problema..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
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

export default function RequesterDashboardPage() {
  return (
    <ProtectedRoute>
      <RequesterDashboardContent />
    </ProtectedRoute>
  );
}
