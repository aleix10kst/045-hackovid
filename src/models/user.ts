export interface User {
  uid: string;
  username?: string;
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  roles: userRole[];
}

export type userRole = 'normal' | 'entitat' | 'superuser';
