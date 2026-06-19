import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ItManagerRoute } from '../../components/ItManagerRoute';
import { useAuth } from '../../contexts/auth-context';
import { useTickets } from '../../hooks/useTickets';
import { useUsers } from '../../hooks/useUsers';

function ItManagerDashboardContent() {
  const { user, organization, logout } = useAuth();
  const { tickets, loading, error, fetchOrganizationTickets, updateTicket, assignTicket } = useTickets();
  const { users, fetchUsers } = useUsers();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    fetchOrganizationTickets();
    fetchUsers();
  }, [fetchOrganizationTickets, fetchUsers]);

  const handleAssign = async (ticketId: string) => {
    if (!assigneeId) return;
    const result = await assignTicket(ticketId, assigneeId);
    if (result.success) {
      setSelectedTicket(null);
      setAssigneeId('');
    }
  };

  const handleStatusUpdate = async (ticketId: string) => {
    if (!statusUpdate) return;
    const result = await updateTicket(ticketId, { status: statusUpdate });
    if (result.success) {
      setStatusUpdate('');
    }
  };

  const agents = users.filter((u) => u.role === 'AGENT');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Panel de IT Manager</h1>
            <span className="text-sm text-gray-500">{organization?.name || 'Sin organización'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <Link href="/it-manager/agents" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Gestionar Agentes
            </Link>
            <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                  </tr>
                )}
                {!loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay tickets</td>
                  </tr>
                )}
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.orgUnit?.name}</td>
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
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.createdBy?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ticket.assignee?.name || 'Sin asignar'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {selectedTicket === ticket.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={assigneeId}
                              onChange={(e) => setAssigneeId(e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Seleccionar agente</option>
                              {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(ticket.id)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Asignar
                            </button>
                            <button
                              onClick={() => { setSelectedTicket(null); setAssigneeId(''); }}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTicket(ticket.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Asignar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ItManagerDashboardPage() {
  return (
    <ItManagerRoute>
      <ItManagerDashboardContent />
    </ItManagerRoute>
  );
}
