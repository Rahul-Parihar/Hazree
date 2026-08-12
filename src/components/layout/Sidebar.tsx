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
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
  onRoleSwitch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, onRoleSwitch }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      name: 'Attendance Logs',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
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
      roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
      badgeCount: 3,
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
    localStorage.removeItem('hazree_user_role');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 z-30 shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-emerald-500/20">
            H
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
                Hazree <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Workforce & Attendance</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Switcher Badge Button */}
      <div className="p-3">
        <button
          onClick={onRoleSwitch}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
            userRole === 'SUPER_ADMIN'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
              : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/50',
            isCollapsed && 'justify-center px-0'
          )}
          title="Click to toggle perspective role"
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">
                {userRole === 'SUPER_ADMIN' ? 'Super Admin Portal' : 'Tata Tech Admin'}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive && 'text-white')} />

              {!isCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {!isCollapsed && item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}

              {!isCollapsed && item.badgeCount && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
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
            isCollapsed && 'justify-center p-1'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden border border-slate-600">
              <img
                src={
                  userRole === 'SUPER_ADMIN'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {userRole === 'SUPER_ADMIN' ? 'Anand Patel' : 'Rajesh Sharma'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {userRole === 'SUPER_ADMIN' ? 'Platform HQ' : 'Tata Tech HR'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
