import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  tenantCode: z.string().length(12).regex(/^\d{12}$/, 'Tenant code must be 12 digits'),
});

export const LoginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
