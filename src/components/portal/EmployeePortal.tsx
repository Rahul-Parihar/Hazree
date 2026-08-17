"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  FileText,
  CalendarRange,
  Building,
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";
import PunchWidget from "./PunchWidget";
import AttendanceCalendar from "./AttendanceCalendar";
import LeaveManager from "./LeaveManager";
import ShiftRoster from "./ShiftRoster";

export default function EmployeePortal() {
  const { activeEmployee } = useCustomerApp();
  const [activeTab, setActiveTab] = useState<
    "punch" | "calendar" | "leaves" | "roster"
  >("punch");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activeEmployee.avatarUrl}
              alt={activeEmployee.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeEmployee.fullName}
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {activeEmployee.employeeCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {activeEmployee.designation} • <span className="text-emerald-400">{activeEmployee.department}</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Building className="w-3 h-3 text-cyan-400" />
              <span>{activeEmployee.companyName}</span>
            </p>
          </div>
        </div>

        {/* Shift Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-white/5 text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Working Shift
            </p>
            <p className="text-xs font-bold text-white font-mono">
              {activeEmployee.shiftName}
            </p>
            <p className="text-[11px] text-emerald-400 font-mono">
              {activeEmployee.shiftStart} - {activeEmployee.shiftEnd}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("punch")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "punch"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Live Punch Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "calendar"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance & History</span>
        </button>

        <button
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "leaves"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Leave Manager</span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "roster"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Weekly Roster</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "punch" && <PunchWidget />}
      {activeTab === "calendar" && <AttendanceCalendar />}
      {activeTab === "leaves" && <LeaveManager />}
      {activeTab === "roster" && <ShiftRoster />}
    </div>
  );
}
