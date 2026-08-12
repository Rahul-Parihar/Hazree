'use client';

import React from 'react';
import { UserRoleProvider } from '../../context/UserRoleContext';
import { DashboardShell } from '../../components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserRoleProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserRoleProvider>
  );
}
