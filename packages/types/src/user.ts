export type UserRole = 'super_admin' | 'admin' | 'agent' | 'requester';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  organizationId: string | null;
  createdAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  slug: string;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant | null;
  organization?: Organization | null;
}

export interface JwtPayload {
  sub: string;
  name: string;
  tenantId: string | null;
  organizationId: string | null;
}
