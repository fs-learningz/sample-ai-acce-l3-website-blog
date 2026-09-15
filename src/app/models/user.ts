export type UserRole = 'Admin' | 'Author';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}
