'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { toggleUserRole } from '../../redux/slices/authSlice';

interface DashboardShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, pageTitle }) => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);

  const handleRoleSwitch = () => {
    dispatch(toggleUserRole());
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar userRole={userRole} onRoleSwitch={handleRoleSwitch} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header userRole={userRole} onRoleSwitch={handleRoleSwitch} title={pageTitle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

