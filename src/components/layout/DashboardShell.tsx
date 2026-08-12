'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUserRole } from '../../context/UserRoleContext';

interface DashboardShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, pageTitle }) => {
  const { userRole, toggleUserRole } = useUserRole();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar userRole={userRole} onRoleSwitch={toggleUserRole} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header userRole={userRole} onRoleSwitch={toggleUserRole} title={pageTitle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
