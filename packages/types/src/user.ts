export type UserRole = 'admin' | 'agent' | 'requester';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
