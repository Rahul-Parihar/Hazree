'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleUserRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');

  useEffect(() => {
    const savedRole = localStorage.getItem('hazree_user_role') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('hazree_user_role', role);
  };

  const toggleUserRole = () => {
    const nextRole = userRole === 'SUPER_ADMIN' ? 'COMPANY_ADMIN' : 'SUPER_ADMIN';
    handleSetUserRole(nextRole);
  };

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        setUserRole: handleSetUserRole,
        toggleUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
