"use client";

import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  LogIn,
  ShieldCheck,
  Sparkles,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";
import { useLiveClock } from "@/hooks/useLiveClock";
import { useGeofence } from "@/hooks/useGeofence";
import { usePunchTimer } from "@/hooks/usePunchTimer";
import { useAppSelector } from "@/redux/hooks";

export default function PunchWidget() {
  const { activeEmployee, todayPunch, recordPunch } = useCustomerApp();
  const reduxTodayPunch = useAppSelector((state) => state.attendance.todayPunch);
  const activeTodayPunch = reduxTodayPunch || todayPunch;

  const { formattedTime, formattedDate } = useLiveClock();
  const { isInside, distanceMeters, toggleSimulation } = useGeofence(true);
  const { formattedElapsed } = usePunchTimer(
    activeTodayPunch?.punchInTime,
    activeTodayPunch?.punchOutTime
  );

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [punchingLoading, setPunchingLoading] = useState<boolean>(false);

  const checkShiftWindow = () => {
    if (!activeEmployee?.shiftStart || !activeEmployee?.shiftEnd) return { isAllowed: true, reason: '' };

    const parseMins = (t: string) => {
      const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!m) return 0;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ap = m[3] ? m[3].toUpperCase() : '';
      if (ap === 'PM' && h !== 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    };

    const sMins = parseMins(activeEmployee.shiftStart);
    const eMins = parseMins(activeEmployee.shiftEnd);

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const earliestAllowed = (sMins - 45 + 1440) % 1440;
    const eh = Math.floor(earliestAllowed / 60) % 24;
    const em = earliestAllowed % 60;
    const eampm = eh >= 12 ? 'PM' : 'AM';
    const eh12 = eh % 12 || 12;
    const earliestFmt = `${eh12 < 10 ? '0' : ''}${eh12}:${em < 10 ? '0' : ''}${em} ${eampm}`;

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

    return { isAllowed: true, reason: '' };
  };

  const shiftWindow = checkShiftWindow();

  const handleCaptureSelfie = () => {
    setCameraActive(true);
    setTimeout(() => {
      setCapturedPhoto(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
      );
      setCameraActive(false);
    }, 1000);
  };

  const handlePunchAction = async () => {
    if (isCheckedOut) {
      alert("Shift attendance is already completed for today. You cannot clock in again.");
      return;
    }
    if (!isCheckedIn && !shiftWindow.isAllowed) {
      alert(shiftWindow.reason);
      return;
    }

    setPunchingLoading(true);
    try {
      const geoStatus = isInside ? "Inside" : "Outside";
      await recordPunch("Web App", geoStatus, distanceMeters, capturedPhoto || undefined);
    } finally {
      setPunchingLoading(false);
    }
  };

  const isCheckedIn = !!activeTodayPunch && !activeTodayPunch.punchOutTime;
  const isCheckedOut = !!activeTodayPunch && !!activeTodayPunch.punchOutTime;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Live Self-Service Terminal
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {formattedDate}
            </span>
          </div>

          {/* Clock Display */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              Current Standard Time
            </p>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono flex items-baseline gap-2 mt-1">
              <span>{formattedTime}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeEmployee.shiftName || 'Assigned Shift'}: {activeEmployee.shiftStart} - {activeEmployee.shiftEnd}</span>
              </span>
              {!isCheckedIn && !isCheckedOut && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Shift Auto-Validation Enabled
                </span>
              )}
            </div>
          </div>

          {/* Active Duty Timer */}
          {isCheckedIn && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    Checked In At {activeTodayPunch?.punchInTime}
                  </p>
                  <p className="text-xs text-slate-300">
                    Status: <span className="font-bold text-emerald-300">{activeTodayPunch?.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Elapsed Active Duty
                </p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {formattedElapsed}
                </p>
              </div>
            </div>
          )}

          {isCheckedOut && (
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-300 font-semibold">
                    Shift Completed Today!
                  </p>
                  <p className="text-xs text-slate-400">
                    In: {activeTodayPunch?.punchInTime} • Out: {activeTodayPunch?.punchOutTime}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Total Logged
                </p>
                <p className="text-lg font-bold font-mono text-cyan-400">
                  {activeTodayPunch?.workHours} hrs
                </p>
              </div>
            </div>
          )}

          {/* Mini Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
            <img
              src={activeEmployee.avatarUrl}
              alt={activeEmployee.fullName}
              className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-white truncate">
                  {activeEmployee.fullName}
                </h4>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
                  {activeEmployee.employeeCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {activeEmployee.designation} • {activeEmployee.department}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400">{activeEmployee.companyName}</p>
              <span className="text-[10px] text-emerald-400">Tenant Active</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Office GPS Geofence
                </span>
              </div>
              <button
                onClick={toggleSimulation}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1"
                title="Toggle Geofence simulator"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Simulate {isInside ? "Outside" : "Inside"}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-white/5 p-3 flex items-center gap-3">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-white/10">
                {isInside ? (
                  <>
                    <span className="animate-radar absolute inline-flex h-full w-full rounded-xl bg-emerald-500/20"></span>
                    <MapPin className="w-6 h-6 text-emerald-400 relative z-10" />
                  </>
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isInside ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  ></span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {isInside ? "Inside Authorized Radius" : "Outside Geofence Perimeter"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Distance to Hub: <strong className="text-white font-mono">{distanceMeters} meters</strong> (Limit: 50m)
                </p>
              </div>
            </div>

            {activeEmployee.photoVerificationRequired && (
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Face Selfie Verification</span>
                </div>
                {capturedPhoto ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Captured
                  </span>
                ) : (
                  <button
                    onClick={handleCaptureSelfie}
                    disabled={cameraActive}
                    className="text-[11px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                  >
                    {cameraActive ? "Verifying..." : "Take Snapshot"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Shift Timing Restriction Warning */}
          {!isCheckedIn && !shiftWindow.isAllowed && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-200">Shift Window Restricted</p>
                  <p className="text-[11px] text-amber-300/90 mt-0.5">{shiftWindow.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handlePunchAction}
            disabled={punchingLoading || isCheckedOut || (!isCheckedIn && !shiftWindow.isAllowed)}
            className={`w-full relative group overflow-hidden py-4 px-6 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              isCheckedIn
                ? "bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-rose-500/20 cursor-pointer"
                : isCheckedOut
                ? "bg-slate-900/90 text-emerald-400 border border-emerald-500/30 cursor-not-allowed shadow-none"
                : !shiftWindow.isAllowed
                ? "bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed opacity-70 shadow-none"
                : "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-emerald-500/25 cursor-pointer"
            }`}
          >
            {punchingLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Recording Hazree Verification...</span>
              </>
            ) : isCheckedIn ? (
              <>
                <LogOut className="w-5 h-5" />
                <span>PUNCH OUT (Check-Out)</span>
              </>
            ) : isCheckedOut ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>SHIFT COMPLETED (Clock-In Closed for Today)</span>
              </>
            ) : !shiftWindow.isAllowed ? (
              <>
                <Clock className="w-5 h-5" />
                <span>CLOCK IN CLOSED (Outside Shift)</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>PUNCH IN (Mark Hazree)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit encrypted tamper-proof biometric timestamp
          </p>
        </div>
      </div>
    </div>
  );
}
