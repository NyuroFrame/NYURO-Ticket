import { z } from 'zod';

export const OrgRegisterSchema = z.object({
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  orgCode: z.string().min(1),
});

export const AdminLoginSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

export const OrgLoginSchema = z.object({
  orgCode: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(1),
});

export type OrgRegisterInput = z.infer<typeof OrgRegisterSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type OrgLoginInput = z.infer<typeof OrgLoginSchema>;
