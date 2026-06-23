import { useState, useEffect } from 'react';
import { AgentRoute } from '../../components/AgentRoute';
import { useAuth } from '../../contexts/auth-context';
import { useTickets } from '../../hooks/useTickets';

function AgentDashboardContent() {
  const { user, logout } = useAuth();
  const { tickets, loading, error, fetchOrganizationTickets, updateTicket, takeTicket } = useTickets();
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [takingId, setTakingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizationTickets();
  }, [fetchOrganizationTickets]);

  const handleTake = async (ticketId: string) => {
    setTakingId(ticketId);
    await takeTicket(ticketId);
    setTakingId(null);
  };

  const handleStatusUpdate = async (ticketId: string) => {
    if (!statusUpdate) return;
    setUpdatingId(ticketId);
    await updateTicket(ticketId, { status: statusUpdate });
    setUpdatingId(null);
    setStatusUpdate('');
  };

  const isAssignedToMe = (ticket: typeof tickets[number]) => ticket.assigneeId === user?.id;
  const isUnassigned = (ticket: typeof tickets[number]) => !ticket.assigneeId;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Panel de Agente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay tickets disponibles</td>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUnassigned(ticket) && (
                          <button
                            onClick={() => handleTake(ticket.id)}
                            disabled={takingId === ticket.id}
                            className="text-sm text-green-600 hover:text-green-800 font-medium disabled:text-gray-400"
                          >
                            {takingId === ticket.id ? 'Tomando...' : 'Tomar'}
                          </button>
                        )}
                        {isAssignedToMe(ticket) && (
                          updatingId === ticket.id ? (
                            <span className="text-sm text-gray-500">Actualizando...</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={statusUpdate}
                                onChange={(e) => setStatusUpdate(e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="">Cambiar estado</option>
                                <option value="IN_PROGRESS">En progreso</option>
                                <option value="RESOLVED">Resuelto</option>
                                <option value="CLOSED">Cerrado</option>
                              </select>
                              <button
                                onClick={() => handleStatusUpdate(ticket.id)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Guardar
                              </button>
                            </div>
                          )
                        )}
                        {!isUnassigned(ticket) && !isAssignedToMe(ticket) && (
                          <span className="text-sm text-gray-400">Asignado a {ticket.assignee?.name}</span>
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

export default function AgentDashboardPage() {
  return (
    <AgentRoute>
      <AgentDashboardContent />
    </AgentRoute>
  );
}
