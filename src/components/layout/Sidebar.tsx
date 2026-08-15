'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  FileText,
  CreditCard,
  RefreshCw,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';

interface SidebarProps {
  userRole: UserRole;
  onRoleSwitch?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  onRoleSwitch,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const pendingLeavesCount = useAppSelector(
    (state) => state.leaves.leaves.filter((l) => l.status === 'Pending').length
  );

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building2,
      roles: ['SUPER_ADMIN'],
      badge: 'Multi-Tenant',
    },
    {
      name: 'Departments',
      href: '/departments',
      icon: Layers,
      roles: ['SUPER_ADMIN'],
      badge: 'Master',
    },
    {
      name: 'Attendance Logs',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['COMPANY_ADMIN'],
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    },
    {
      name: 'Leave Requests',
      href: '/leaves',
      icon: FileText,
      roles: ['COMPANY_ADMIN'],
      badgeCount: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    {
      name: 'Subscription Plans',
      href: '/subscriptions',
      icon: CreditCard,
      roles: ['SUPER_ADMIN'],
      badge: 'Plans',
    },
    {
      name: 'Renewals & Status',
      href: '/renewals',
      icon: RefreshCw,
      roles: ['SUPER_ADMIN'],
      badge: 'Expiry',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = () => {
    dispatch(logout());
    if (onCloseMobile) onCloseMobile();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 shrink-0 shadow-2xl lg:shadow-none lg:static',
        // Mobile Drawer positioning
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop collapse widths
        isCollapsed ? 'lg:w-20' : 'w-72 lg:w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
            H
          </div>
          <div className={cn(isCollapsed ? 'lg:hidden' : 'block')}>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
              Hazree <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Workforce & Attendance</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Authenticated Portal Identity Badge */}
      <div className="p-3">
        <div
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold border shadow-sm',
            userRole === 'SUPER_ADMIN'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
              : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60',
            isCollapsed && 'lg:justify-center lg:px-0'
          )}
        >
          {userRole === 'SUPER_ADMIN' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
          )}

          <div className={cn('flex items-center justify-between w-full min-w-0', isCollapsed && 'lg:hidden')}>
            <span className="truncate">
              {userRole === 'SUPER_ADMIN' ? 'Super Admin Portal' : (currentUser?.companyName || 'Company Portal')}
            </span>
            <span className={cn(
              'w-2 h-2 rounded-full shrink-0 ml-2',
              userRole === 'SUPER_ADMIN' ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400 animate-pulse'
            )} />
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive && 'text-white')} />

              <span className={cn('flex-1 truncate', isCollapsed && 'lg:hidden')}>
                {item.name}
              </span>

              {item.badge && (
                <span className={cn('text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', isCollapsed && 'lg:hidden')}>
                  {item.badge}
                </span>
              )}

              {item.badgeCount && (
                <span className={cn('w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center', isCollapsed && 'lg:hidden')}>
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div
          className={cn(
            'flex items-center justify-between p-2 rounded-xl bg-slate-800/50',
            isCollapsed && 'lg:justify-center lg:p-1'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden border border-slate-600">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={cn('min-w-0', isCollapsed && 'lg:hidden')}>
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || (userRole === 'SUPER_ADMIN' ? 'Anand Patel' : 'Rajesh Sharma')}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser?.companyName || (userRole === 'SUPER_ADMIN' ? 'Platform HQ' : 'Tata Tech HR')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={cn('p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors', isCollapsed && 'lg:hidden')}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
