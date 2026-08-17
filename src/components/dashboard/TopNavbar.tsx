"use client";

import React from "react";
import {
  Search,
  LayoutGrid,
  Clock,
  Plus,
  Bell,
  Power,
} from "lucide-react";

interface TopNavbarProps {
  onLogout: () => void;
  activeNav: string;
}

export default function TopNavbar({ onLogout, activeNav }: TopNavbarProps) {
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
      {/* Left: Breadcrumbs */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {getNavTitle()}
        </h1>
        <span className="text-xs text-slate-400 font-normal">
          {activeNav === "settings"
            ? "Home • Settings • Profile Settings"
            : `Home • ${getNavTitle()}`}
        </span>
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
