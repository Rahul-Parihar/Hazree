"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import WeekTimelogsWidget from "./WeekTimelogsWidget";
import { BirthdaysCard, EmployeeAppreciations } from "./EmployeeAppreciations";
import AttendanceCalendar from "../portal/AttendanceCalendar";
import AttendanceMatrixView from "./AttendanceMatrixView";
import LeavesView from "./LeavesView";
import MyCalendarView from "./MyCalendarView";
import NoticeBoardView from "./NoticeBoardView";
import ProfileSettingsView from "./ProfileSettingsView";
import MessagesView from "./MessagesView";
import EventsView from "./EventsView";
import { toast } from "sonner";
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
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";
import { useLiveClock } from "../../hooks/useLiveClock";

interface EmployeeDashboardLayoutProps {
  onLogout: () => void;
}

export default function EmployeeDashboardLayout({
  onLogout,
}: EmployeeDashboardLayoutProps) {
  const { activeEmployee, todayPunch, recordPunch, leaveBalance } = useCustomerApp();
  const { formattedTime } = useLiveClock();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isClockedIn) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn]);

  const formatElapsed = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSec % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const checkShiftWindow = () => {
    if (!activeEmployee?.shiftStart || !activeEmployee?.shiftEnd) return { isAllowed: true, reason: "" };

    const parseMins = (t: string) => {
      const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!m) return 0;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ap = m[3] ? m[3].toUpperCase() : "";
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      return h * 60 + min;
    };

    const sMins = parseMins(activeEmployee.shiftStart);
    const eMins = parseMins(activeEmployee.shiftEnd);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const earliestAllowed = (sMins - 45 + 1440) % 1440;
    const eh = Math.floor(earliestAllowed / 60) % 24;
    const em = earliestAllowed % 60;
    const eampm = eh >= 12 ? "PM" : "AM";
    const eh12 = eh % 12 || 12;
    const earliestFmt = `${eh12 < 10 ? "0" : ""}${eh12}:${em < 10 ? "0" : ""}${em} ${eampm}`;

    if (sMins < eMins) {
      if (nowMins < sMins - 45) {
        return {
          isAllowed: false,
          reason: `Early Clock-in: Shift starts at ${activeEmployee.shiftStart}. Clock-in opens at ${earliestFmt}.`,
        };
      }
      if (nowMins > eMins) {
        return {
          isAllowed: false,
          reason: `Shift Closed: Your assigned shift ended at ${activeEmployee.shiftEnd}. Clock-in is closed for your shift hours.`,
        };
      }
    } else {
      // Overnight Shift (e.g. 08:00 PM to 08:00 AM)
      const isAllowed = nowMins >= (sMins - 45 + 1440) % 1440 || nowMins <= eMins;
      if (!isAllowed) {
        return {
          isAllowed: false,
          reason: `Outside Shift Window: Your assigned shift (${activeEmployee.shiftName || 'Shift 2'}) is active from ${activeEmployee.shiftStart} to ${activeEmployee.shiftEnd}. Early clock-in opens at ${earliestFmt}.`,
        };
      }
    }

    return { isAllowed: true, reason: "" };
  };

  const shiftWindow = checkShiftWindow();

  const handleClockToggle = () => {
    if (isClockedIn) {
      recordPunch("Web App", "Inside", 10);
      setIsClockedIn(false);
    } else {
      if (!shiftWindow.isAllowed) {
        toast.error(shiftWindow.reason);
        return;
      }
      recordPunch("Web App", "Inside", 10);
      setIsClockedIn(true);
      setClockInTime(formattedTime);
      setElapsedSeconds(0);
    }
  };

  const userDisplayName = activeEmployee?.fullName || "Anand Patel";
  const userRole = activeEmployee?.designation || "Tech Lead";
  const employeeCode = activeEmployee?.employeeCode || "GT-153";

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        userFullName={userDisplayName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onLogout={onLogout} activeNav={activeNav} />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeNav === "dashboard" && (
            <>
              {/* Header Greeting & Clock In/Out Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Welcome {userDisplayName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shift: <strong>{activeEmployee?.shiftName || 'Shift 1'} ({activeEmployee?.shiftStart || '09:00 AM'} - {activeEmployee?.shiftEnd || '06:00 PM'})</strong>
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
                        Monday •{" "}
                        <span className="text-emerald-600 font-medium font-mono">
                          Clock In at {clockInTime} ({formatElapsed(elapsedSeconds)})
                        </span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleClockToggle}
                    disabled={!isClockedIn && !shiftWindow.isAllowed}
                    title={!isClockedIn && !shiftWindow.isAllowed ? shiftWindow.reason : undefined}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                      isClockedIn
                        ? "bg-[#d32f2f] hover:bg-[#b71c1c] shadow-red-500/20"
                        : !shiftWindow.isAllowed
                        ? "bg-slate-400 text-slate-200 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    }`}
                  >
                    {isClockedIn ? (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Clock Out</span>
                      </>
                    ) : !shiftWindow.isAllowed ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Clock In Locked (Outside Shift)</span>
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

              {/* Shift Warning Banner if outside assigned shift window */}
              {!isClockedIn && !shiftWindow.isAllowed && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{shiftWindow.reason}</span>
                </div>
              )}

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

                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 truncate">
                        {userDisplayName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {userRole}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Employee Id : {employeeCode}
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
                      August Attendance
                    </h4>
                    <CalendarDays className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600 font-mono">
                        18
                      </p>
                      <span className="text-[11px] text-slate-400">Present Days</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-500 font-mono">
                        1
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
                        GPS Geofence Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[11px]">Punch In</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          {isClockedIn ? clockInTime : "--:--"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[11px]">Punch Out</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          {!isClockedIn ? formattedTime : "--:--"}
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
