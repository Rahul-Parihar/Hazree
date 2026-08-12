'use client';

import React, { createContext, useContext } from 'react';
import { UserRole } from '../types';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setUserRole, toggleUserRole } from '../redux/slices/authSlice';

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleUserRole: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);

  const handleSetUserRole = (role: UserRole) => {
    dispatch(setUserRole(role));
  };

  const handleToggleUserRole = () => {
    dispatch(toggleUserRole());
  };

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        setUserRole: handleSetUserRole,
        toggleUserRole: handleToggleUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);

  return {
    userRole,
    setUserRole: (role: UserRole) => dispatch(setUserRole(role)),
    toggleUserRole: () => dispatch(toggleUserRole()),
  };
};

