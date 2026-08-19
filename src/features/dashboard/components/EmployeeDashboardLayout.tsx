"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import WeekTimelogsWidget from "./WeekTimelogsWidget";
import { BirthdaysCard, EmployeeAppreciations } from "./EmployeeAppreciations";
import AttendanceCalendar from "@/features/attendance/components/AttendanceCalendar";
import AttendanceMatrixView from "@/features/attendance/components/AttendanceMatrixView";
import LeavesView from "@/features/leaves/components/LeavesView";
import MyCalendarView from "./MyCalendarView";
import NoticeBoardView from "./NoticeBoardView";
import ProfileSettingsView from "./ProfileSettingsView";
import MessagesView from "./MessagesView";
import EventsView from "./EventsView";
import {
  User,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar,
  Clock,
  CalendarDays,
  FileCheck2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";
import { useLiveClock } from "@/hooks/useLiveClock";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  fetchAttendanceAsync,
  incrementElapsedSeconds,
} from "@/redux/slices/attendanceSlice";

interface EmployeeDashboardLayoutProps {
  onLogout: () => void;
}

export default function EmployeeDashboardLayout({
  onLogout,
}: EmployeeDashboardLayoutProps) {
  const dispatch = useAppDispatch();
  const { activeEmployee, todayPunch, recordPunch, leaveBalance, punchRecords } = useCustomerApp();
  const { formattedTime } = useLiveClock();
  const [activeNav, setActiveNav] = useState("dashboard");

  // Use Redux state for clock-in status (synced with backend)
  const isClockedIn = useAppSelector((state) => state.attendance.isClockedIn);
  const clockInTime = useAppSelector((state) => state.attendance.clockInTime);
  const elapsedSeconds = useAppSelector((state) => state.attendance.elapsedSeconds);

  // Elapsed seconds timer — driven by Redux
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isClockedIn) {
      interval = setInterval(() => {
        dispatch(incrementElapsedSeconds());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, dispatch]);

  // 15-second polling to sync attendance state from backend
  // This enables admin-initiated clock-ins to reflect here automatically
  useEffect(() => {
    if (!activeEmployee?.id) return;

    const pollAttendance = () => {
      dispatch(
        fetchAttendanceAsync({
          employeeId: activeEmployee.id,
          employeeCode: activeEmployee.employeeCode,
        })
      );
    };

    // Poll every 15 seconds
    const pollInterval = setInterval(pollAttendance, 15000);

    return () => clearInterval(pollInterval);
  }, [activeEmployee?.id, activeEmployee?.employeeCode, dispatch]);

  // Compute dynamic attendance stats from punchRecords
  const currentMonth = new Date().getMonth(); // 0-indexed
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString("en-IN", { month: "long" });

  const monthlyStats = useMemo(() => {
    const empId = activeEmployee?.id;
    if (!empId) return { present: 0, late: 0, halfDay: 0, absent: 0 };

    const monthRecords = punchRecords.filter((p) => {
      const targetId = Number(String(p.employeeId).replace("emp_", ""));
      if (targetId !== Number(String(empId).replace("emp_", ""))) return false;
      // Parse date — support YYYY-MM-DD and DD/MM/YYYY formats
      let recordDate: Date | null = null;
      if (p.date && p.date.includes("-")) {
        recordDate = new Date(p.date);
      } else if (p.date && p.date.includes("/")) {
        const parts = p.date.split("/");
        recordDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      if (!recordDate || isNaN(recordDate.getTime())) return false;
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    let present = 0, late = 0, halfDay = 0, absent = 0;
    monthRecords.forEach((r) => {
      if (r.status === "Present") present++;
      else if (r.status === "Late") { late++; present++; } // Late is also present
      else if (r.status === "Half Day") halfDay++;
      else if (r.status === "Absent") absent++;
    });

    return { present, late, halfDay, absent };
  }, [punchRecords, activeEmployee?.id, currentMonth, currentYear]);

  const formatElapsed = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSec % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleClockToggle = () => {
    recordPunch("Web App", "Inside", 10);
    // After punch, re-fetch from backend to ensure sync
    setTimeout(() => {
      if (activeEmployee?.id) {
        dispatch(
          fetchAttendanceAsync({
            employeeId: activeEmployee.id,
            employeeCode: activeEmployee.employeeCode,
          })
        );
      }
    }, 500);
  };

  const userDisplayName = activeEmployee?.fullName || "Employee";
  const userRole = activeEmployee?.designation || "Staff Member";
  const employeeCode = activeEmployee?.employeeCode || `EMP-${activeEmployee?.id || 1}`;
  const companyName = activeEmployee?.companyName || "Hazree Organization";

  // Derive punch in/out times from todayPunch (backend-synced)
  const punchInDisplay = todayPunch?.punchInTime || clockInTime || "--:--";
  const punchOutDisplay = todayPunch?.punchOutTime || (isClockedIn ? "--:--" : "--:--");

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        userFullName={userDisplayName}
        companyName={companyName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onLogout={onLogout} activeNav={activeNav} companyName={companyName} />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeNav === "dashboard" && (
            <>
              {/* Header Greeting & Clock In/Out Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Welcome, {userDisplayName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-full shadow-xs">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{companyName}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Employee portal overview and daily attendance dashboard
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {isClockedIn && (
                    <div className="text-right animate-fade-in">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <p className="text-base font-bold text-slate-900 font-mono tracking-tight">
                          {formattedTime}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Active Shift •{" "}
                        <span className="text-emerald-600 font-medium font-mono">
                          Clock In at {punchInDisplay} ({formatElapsed(elapsedSeconds)})
                        </span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleClockToggle}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                      isClockedIn
                        ? "bg-[#d32f2f] hover:bg-[#b71c1c] shadow-red-500/20"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    }`}
                  >
                    {isClockedIn ? (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Clock Out</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Clock In</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Top Stats Grid: Profile Summary, Attendance Stats, Leave Quota */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Profile Card */}
                <div className="md:col-span-6 lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl overflow-hidden shrink-0">
                      {activeEmployee?.avatarUrl ? (
                        <img
                          src={activeEmployee.avatarUrl}
                          alt={userDisplayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-slate-900 truncate">
                        {userDisplayName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {userRole}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/90 px-2.5 py-0.5 rounded-md border border-blue-200/60 w-fit mt-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[180px]">{companyName}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Employee ID: {employeeCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Working Shift</span>
                      <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                        {activeEmployee.shiftName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Department</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {activeEmployee.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="md:col-span-3 lg:col-span-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                      {currentMonthName} Attendance
                    </h4>
                    <CalendarDays className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 font-mono">
                        {monthlyStats.present}
                      </p>
                      <span className="text-[11px] text-slate-400">Present Days</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-500 font-mono">
                        {monthlyStats.late}
                      </p>
                      <span className="text-[11px] text-slate-400">Late Mark</span>
                    </div>
                  </div>
                </div>

                {/* Leave Balance Stats */}
                <div className="md:col-span-3 lg:col-span-3.5 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                      Leave Quota
                    </h4>
                    <FileCheck2 className="w-5 h-5 text-blue-500" />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-2xl font-bold text-[#1a73e8] font-mono">
                        {leaveBalance.casual.remaining}
                      </p>
                      <span className="text-[11px] text-slate-400">Casual Left</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600 font-mono">
                        {leaveBalance.earned.remaining}
                      </p>
                      <span className="text-[11px] text-slate-400">Earned Left</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mid Row: Left Column (Birthdays & Appreciations) + Right Column (Week Timelogs & Shift Details) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column (5 Cols) */}
                <div className="lg:col-span-5 space-y-5">
                  <BirthdaysCard />
                  <EmployeeAppreciations />
                </div>

                {/* Right Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <WeekTimelogsWidget />

                  {/* Attendance Log Quick Summary Card */}
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                        Today's Attendance Status
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {isClockedIn ? "🟢 Live Session Active" : "GPS Geofence Verified"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[11px]">Punch In</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          {punchInDisplay}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[11px]">Punch Out</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          {punchOutDisplay}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[11px]">Shift Timing</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          09:30 - 18:30
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: On Leave Today */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-3">
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                  On Leave Today
                </h3>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>All team members are active on duty today. No leaves recorded.</span>
                </div>
              </div>
            </>
          )}

          {activeNav === "calendar" && <MyCalendarView />}
          {activeNav === "leaves" && <LeavesView />}
          {activeNav === "attendance" && <AttendanceMatrixView />}
          {activeNav === "notices" && <NoticeBoardView />}
          {activeNav === "messages" && <MessagesView />}
          {activeNav === "events" && <EventsView />}
          {activeNav === "settings" && <ProfileSettingsView />}
        </div>
      </div>
    </div>
  );
}
