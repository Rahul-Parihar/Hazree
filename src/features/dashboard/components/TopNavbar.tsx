"use client";

import React from "react";
import {
  Search,
  LayoutGrid,
  Clock,
  Plus,
  Bell,
  Power,
  Building2,
} from "lucide-react";

interface TopNavbarProps {
  onLogout: () => void;
  activeNav: string;
  companyName?: string;
}

export default function TopNavbar({ onLogout, activeNav, companyName = "Hazree Organization" }: TopNavbarProps) {
  const getNavTitle = () => {
    switch (activeNav) {
      case "calendar":
        return "My Calendar";
      case "attendance":
        return "Attendance";
      case "leaves":
        return "Leaves";
      case "notices":
        return "Notice Board";
      case "messages":
        return "Messages";
      case "events":
        return "Events";
      case "settings":
        return "Profile Settings";
      case "tasks":
        return "My Tasks";
      case "projects":
        return "Projects";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10 shrink-0">
      {/* Left: Breadcrumbs & Company Tag */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {getNavTitle()}
          </h1>
          <span className="text-[11px] text-slate-400 font-normal">
            {activeNav === "settings"
              ? "Home • Settings • Profile Settings"
              : `Home • ${getNavTitle()}`}
          </span>
        </div>

        {companyName && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200/70 text-blue-800 text-xs font-semibold shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[220px]">{companyName}</span>
          </div>
        )}
      </div>

      {/* Right: Action icons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Apps Grid"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Active Timers"
        >
          <Clock className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Quick Add"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Notifications with badge */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
            2
          </span>
        </button>

        {/* Power / Logout */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          title="Log Out"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
