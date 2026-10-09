import { Badge, toneForPriority, toneForTicketStatus } from '@nyuro/ui';
import { formatDateTime, ticketRef } from '../../lib/format';
import type { TicketSummary } from '../../lib/repositories';

/**
 * Tabla densa empresarial M04/M05: ref mono + estado + prioridad + responsable.
 * SRP: render puro; filtrado y paginación viven en la página (OCP).
 */
export function TicketTable({ tickets }: { tickets: TicketSummary[] }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="table-dense w-full">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Caso</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Responsable</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.ref} className="hover:bg-slate-50">
              <td className="ref-mono whitespace-nowrap">{ticketRef(t.ref)}</td>
              <td>
                <span className="font-medium">{t.title}</span>
                <span className="block text-xs text-ink-500">{t.requester}</span>
              </td>
              <td>
                <Badge tone={toneForTicketStatus(t.status)}>{t.status.replace('_', ' ')}</Badge>
              </td>
              <td>
                <Badge tone={toneForPriority(t.priority)}>{t.priority}</Badge>
              </td>
              <td className="tnum">{t.assignee ?? 'Sin asignar'}</td>
              <td className="tnum whitespace-nowrap">{formatDateTime(t.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
