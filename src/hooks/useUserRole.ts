import { useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'GERENTE' | 'OPERADOR' | null;

export const useUserRole = (): UserRole => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as UserRole;
    setUserRole(role);
  }, []);

  return userRole;
};

export const canCreate = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'GERENTE';
};

export const canEdit = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'GERENTE';
};

export const canDelete = (role: UserRole): boolean => {
  return role === 'ADMIN' || role === 'GERENTE';
};

export const isAdmin = (role: UserRole): boolean => {
  return role === 'ADMIN';
};
