import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'agent', 'requester']).default('requester'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
