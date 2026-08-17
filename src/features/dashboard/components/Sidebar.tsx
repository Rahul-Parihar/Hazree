"use client";

import React, { useState } from "react";
import {
  Home,
  Calendar,
  Users,
  Headphones,
  CalendarDays,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Settings,
  ChevronRight,
  ChevronLeft,
  Building2,
} from "lucide-react";

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  userFullName: string;
  companyName?: string;
}

export default function Sidebar({
  activeNav,
  setActiveNav,
  userFullName,
  companyName = "Hazree Organization",
}: SidebarProps) {
  const [isHrOpen, setIsHrOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "calendar", label: "My Calendar", icon: Calendar },
  ];

  const secondaryItems = [
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-60"
        } bg-[#111622] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen transition-all duration-300 select-none border-r border-slate-800/80 z-20`}
    >
      {/* Top Brand & Profile */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hazree circular logo */}
            <div className="w-8 h-8 rounded-full bg-blue-600 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-full h-full bg-[#111622] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-400">H</span>
              </div>
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-white tracking-wide truncate">
                  Hazree
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                  <span className="truncate" title={userFullName}>{userFullName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-xs font-medium">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                  ? "bg-slate-800/90 text-white font-semibold shadow-inner"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* HR Submenu */}
        <div>
          <button
            onClick={() => setIsHrOpen(!isHrOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              {!collapsed && <span>Attendance</span>}
            </div>
            {!collapsed && (
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${isHrOpen ? "rotate-90" : ""
                  }`}
              />
            )}
          </button>
          {isHrOpen && !collapsed && (
            <div className="pl-9 pr-2 py-1 space-y-1 text-[11px]">
              <button
                onClick={() => setActiveNav("attendance")}
                className={`w-full text-left py-1.5 px-2 rounded hover:text-white ${activeNav === "attendance" ? "text-blue-400 font-semibold" : "text-slate-400"
                  }`}
              >
                Attendance Logs
              </button>
              <button
                onClick={() => setActiveNav("leaves")}
                className={`w-full text-left py-1.5 px-2 rounded hover:text-white ${activeNav === "leaves" ? "text-blue-400 font-semibold" : "text-slate-400"
                  }`}
              >
                Leaves
              </button>
              <button
                onClick={() => setActiveNav("calendar")}
                className={`w-full text-left py-1.5 px-2 rounded hover:text-white ${activeNav === "calendar" ? "text-blue-400 font-semibold" : "text-slate-400"
                  }`}
              >
                Monthly Calendar
              </button>
            </div>
          )}
        </div>

        {/* Secondary Items */}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                  ? "bg-slate-800/90 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
            >
              <Icon className="w-4 h-4" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Collapse & Version */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Sidebar"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""
              }`}
          />
        </button>
        {!collapsed && <span className="font-mono text-[10px]">v5.5.12</span>}
      </div>
    </aside>
  );
}
