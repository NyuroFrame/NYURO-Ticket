export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  priority: TicketPriority;
  assigneeId?: string;
}
