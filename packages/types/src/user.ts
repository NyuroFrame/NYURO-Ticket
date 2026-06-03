export type UserRole = 'super_admin' | 'admin' | 'agent' | 'requester';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: Date;
}

export interface Tenant {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
}

export interface JwtPayload {
  sub: string;
  name: string;
  tenantCode: string;
}
