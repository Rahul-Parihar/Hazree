'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  userRole: UserRole;
  onRoleSwitch: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ userRole, onRoleSwitch, title }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setCurrentTime(`${dateStr} • ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Title & Live Status */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {title || (userRole === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Company Attendance Dashboard')}
          </h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{currentTime || '12 Aug 2026 • Live'}</span>
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill Button */}
        <button
          onClick={onRoleSwitch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
          <span>Switch to {userRole === 'SUPER_ADMIN' ? 'Company HR Admin' : 'Super Admin'}</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Hazree (Ctrl + K)..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
