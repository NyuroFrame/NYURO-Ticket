interface TicketCardProps {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export function TicketCard({ id, title, status, priority }: TicketCardProps) {
  return (
    <div data-ticket-id={id}>
      <h3>{title}</h3>
      <span data-status={status}>{status}</span>
      <span data-priority={priority}>{priority}</span>
    </div>
  );
}
