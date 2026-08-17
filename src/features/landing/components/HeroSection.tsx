"use client";

import React from "react";
import {
  Clock,
  ArrowRight,
  UserCheck,
  Tv,
  CheckCircle2,
  Zap,
  MapPin,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";
import { useLiveClock } from "@/hooks/useLiveClock";

interface HeroSectionProps {
  onOpenPortal: () => void;
  onOpenKiosk: () => void;
  onOpenOnboarding: () => void;
}

export default function HeroSection({
  onOpenPortal,
  onOpenKiosk,
  onOpenOnboarding,
}: HeroSectionProps) {
  const { activeEmployee, todayPunch, recordPunch } = useCustomerApp();
  const { formattedTime } = useLiveClock();

  const isCheckedIn = !!todayPunch && !todayPunch.punchOutTime;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Glows & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Next-Gen Workforce Attendance Suite</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Say Goodbye to <br className="hidden sm:inline" />
              <span className="gradient-text-emerald">Proxy Attendance</span> &{" "}
              <br className="hidden sm:inline" />
              Manual Registers.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Hazree empowers modern Indian businesses with{" "}
              <strong className="text-white">GPS Geofencing</strong>,{" "}
              <strong className="text-white">AI Selfie Verification</strong>,{" "}
              rotational shift tracking, and seamless 1-click payroll integration.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenPortal}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Try Employee Self-Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenKiosk}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white text-sm font-semibold transition-all"
              >
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Launch Tablet Kiosk</span>
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">
                  99.98%
                </p>
                <p className="text-[11px] text-slate-400">Zero Proxy Punches</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  18+ Hrs
                </p>
                <p className="text-[11px] text-slate-400">HR Time Saved/Mo</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  1-Click
                </p>
                <p className="text-[11px] text-slate-400">Payroll Calculation</p>
              </div>
            </div>
          </div>

          {/* Right Interactive Live Punch Terminal Card */}
          <div className="lg:col-span-5 relative">
            {/* Floating badge */}
            <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xl animate-float">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Interactive Simulator</span>
            </div>

            {/* Terminal Card */}
            <div className="rounded-3xl bg-slate-900/95 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={activeEmployee.avatarUrl}
                    alt={activeEmployee.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {activeEmployee.fullName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {activeEmployee.designation}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-emerald-400">
                    {formattedTime}
                  </span>
                  <p className="text-[10px] text-slate-400">IST Clock</p>
                </div>
              </div>

              {/* Geofence Radar Status */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <span className="animate-radar absolute inline-flex h-full w-full rounded-lg bg-emerald-400 opacity-20"></span>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Office Geofence Active
                    </p>
                    <p className="text-[10px] text-emerald-400">
                      12m from Sector 62 Hub (Allowed: 50m)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  INSIDE
                </span>
              </div>

              {/* Status or Punch Action */}
              <div className="space-y-2">
                <button
                  onClick={() => recordPunch("Web App", "Inside", 12)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    isCheckedIn
                      ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {isCheckedIn
                      ? `CHECK OUT (${todayPunch?.punchInTime} In)`
                      : "PUNCH IN NOW"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Click to test punch simulation with GPS audit logs
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No Fake GPS / Mock Apps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Selfie Capture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Sync to Payroll</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rotational Shifts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
