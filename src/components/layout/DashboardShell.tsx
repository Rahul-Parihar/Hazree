'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector } from '../../redux/hooks';
import { useAttendanceWebSocket } from '../../hooks/useAttendanceWebSocket';

interface DashboardShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, pageTitle }) => {
  useAttendanceWebSocket();
  const router = useRouter();
  const pathname = usePathname();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('hazree_access_token') : null;
    if (!token && !pathname.includes('/login')) {
      router.push('/login');
    }
  }, [pathname, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation drawer"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* Responsive Sidebar Navigation */}
      <Sidebar
        userRole={userRole}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          userRole={userRole}
          title={pageTitle}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
