'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, Menu } from 'lucide-react';
import { UserRole } from '../../types';
import { useAppSelector } from '../../redux/hooks';

interface HeaderProps {
  userRole: UserRole;
  onRoleSwitch?: () => void;
  title?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userRole, title, onToggleMobileMenu }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const currentUser = useAppSelector((state) => state.auth.currentUser);

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
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Title & Live Status + Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="flex lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[180px] xs:max-w-[240px] sm:max-w-xs md:max-w-md lg:max-w-none">
            {title || (userRole === 'SUPER_ADMIN' ? 'Super Admin Control Center' : `${currentUser?.companyName || 'Company'} Attendance Dashboard`)}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:flex items-center gap-1.5 font-medium truncate">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{currentTime || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Bar (Tablet/Desktop) */}
        <div className="relative hidden md:block w-48 lg:w-64">
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
            aria-label="View notifications"
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
