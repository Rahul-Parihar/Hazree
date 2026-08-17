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

export default function PunchWidget() {
  const { activeEmployee, todayPunch, recordPunch } = useCustomerApp();
  const { formattedTime, formattedDate } = useLiveClock();
  const { isInside, distanceMeters, toggleSimulation } = useGeofence(true);
  const { formattedElapsed } = usePunchTimer(
    todayPunch?.punchInTime,
    todayPunch?.punchOutTime
  );

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [punchingLoading, setPunchingLoading] = useState<boolean>(false);

  const handleCaptureSelfie = () => {
    setCameraActive(true);
    setTimeout(() => {
      setCapturedPhoto(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
      );
      setCameraActive(false);
    }, 1000);
  };

  const handlePunchAction = () => {
    setPunchingLoading(true);
    setTimeout(() => {
      const geoStatus = isInside ? "Inside" : "Outside";
      recordPunch("Web App", geoStatus, distanceMeters, capturedPhoto || undefined);
      setPunchingLoading(false);
    }, 600);
  };

  const isCheckedIn = !!todayPunch && !todayPunch.punchOutTime;
  const isCheckedOut = !!todayPunch && !!todayPunch.punchOutTime;

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
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Assigned Shift: <span className="text-slate-200 font-medium">{activeEmployee.shiftName}</span> ({activeEmployee.shiftStart} - {activeEmployee.shiftEnd})
            </p>
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
                    Checked In At {todayPunch.punchInTime}
                  </p>
                  <p className="text-xs text-slate-300">
                    Status: <span className="font-bold text-emerald-300">{todayPunch.status}</span>
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
                    In: {todayPunch.punchInTime} • Out: {todayPunch.punchOutTime}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Total Logged
                </p>
                <p className="text-lg font-bold font-mono text-cyan-400">
                  {todayPunch.workHours} hrs
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

          {/* Action Button */}
          <button
            onClick={handlePunchAction}
            disabled={punchingLoading}
            className={`w-full relative group overflow-hidden py-4 px-6 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              isCheckedIn
                ? "bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-rose-500/20"
                : "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-emerald-500/25"
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
