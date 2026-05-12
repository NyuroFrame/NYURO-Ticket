import { z } from 'zod';

export const CreateTicketSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
});

export const UpdateTicketSchema = CreateTicketSchema.partial().extend({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
