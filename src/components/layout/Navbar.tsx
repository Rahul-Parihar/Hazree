"use client";

import React from "react";
import {
  Clock,
  UserCheck,
  Tv,
  LogIn,
  ExternalLink,
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";
import { siteConfig } from "../../config/site";

interface NavbarProps {
  currentView: "login" | "landing" | "portal" | "kiosk";
  setCurrentView: (view: "login" | "landing" | "portal" | "kiosk") => void;
}

export default function Navbar({
  currentView,
  setCurrentView,
}: NavbarProps) {
  const {
    employees,
    activeEmployee,
    setActiveEmployee,
    backendOnline,
  } = useCustomerApp();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentView("landing")}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0b101b] rounded-[10px] flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  {siteConfig.name.toUpperCase()}
                </span>
                <span className="hidden sm:inline-block text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Customer Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Smart Geofence Attendance & ESS
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setCurrentView("login")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === "login"
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In (Login)
            </button>
            <button
              onClick={() => setCurrentView("landing")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === "landing"
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview & Features
            </button>
            <button
              onClick={() => setCurrentView("portal")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === "portal"
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Employee Self-Service
            </button>
            <button
              onClick={() => setCurrentView("kiosk")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === "kiosk"
                  ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Front-Desk Kiosk
            </button>
          </div>

          {/* Right Actions: Switch Demo Employee & Login Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Profile Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-all">
                <img
                  src={activeEmployee.avatarUrl}
                  alt={activeEmployee.fullName}
                  className="w-5 h-5 rounded-full object-cover border border-blue-400"
                />
                <span className="hidden md:inline font-medium text-slate-100 max-w-[100px] truncate">
                  {activeEmployee.fullName.split(" ")[0]}
                </span>
                <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                  {activeEmployee.employeeCode}
                </span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-64 p-2 bg-[#0e1626] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch Active Employee (Demo)
                </p>
                <div className="space-y-1 mt-1">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setActiveEmployee(emp);
                        setCurrentView("portal");
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                        activeEmployee.id === emp.id
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : "hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <img
                        src={emp.avatarUrl}
                        alt={emp.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-100 truncate">
                          {emp.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {emp.designation}
                        </p>
                      </div>
                      {activeEmployee.id === emp.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Login / Portal Switch Action */}
            {currentView === "login" ? (
              <button
                onClick={() => setCurrentView("portal")}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open ESS Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView("login")}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backend indicator status bar */}
      <div className="bg-slate-950/80 border-t border-white/5 py-1 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            ></span>
            <span>
              {backendOnline
                ? "Hazree Core Engine Online (FastAPI :8000 Sync Active)"
                : "Hazree Offline / Local Storage Sandbox Mode"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-400">
              Shift: <strong className="text-slate-200">{activeEmployee.shiftName}</strong> ({activeEmployee.shiftStart} - {activeEmployee.shiftEnd})
            </span>
            <a
              href={siteConfig.adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              <span>Admin Console (:3000)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
