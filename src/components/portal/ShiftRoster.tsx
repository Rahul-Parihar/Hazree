"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Coffee,
  ShieldCheck,
  CheckCircle2,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { ShiftDay } from "../../types/customer";

export default function ShiftRoster() {
  const [shifts] = useState<ShiftDay[]>([]);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string>("");

  const handleRequestSwap = (day: string) => {
    setSwapSuccessMsg(`Shift swap request for ${day} sent to Shift Manager!`);
    setTimeout(() => setSwapSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-white">Weekly Shift Roster</h3>
          <p className="text-xs text-slate-400">
            Assigned weekly work schedule, breaks & weekly offs
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>General 45-hr Work Week</span>
        </div>
      </div>

      {swapSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{swapSuccessMsg}</span>
        </div>
      )}

      {/* Week Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {shifts.map((shift, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              shift.isOff
                ? "bg-slate-900/40 border-white/5 opacity-70"
                : "bg-slate-900/90 border-white/10 hover:border-emerald-500/40 shadow-lg"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {shift.dayName.slice(0, 3)}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {shift.date.split(" ")[0]} {shift.date.split(" ")[1]}
                </span>
              </div>

              {shift.isOff ? (
                <div className="py-4 text-center">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                    WEEKLY OFF
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-emerald-400">
                    {shift.shiftTitle}
                  </p>
                  <p className="text-xs font-mono font-bold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {shift.startTime} - {shift.endTime}
                  </p>
                  <div className="pt-2 border-t border-white/5 text-[10px] text-slate-400 space-y-1">
                    <p className="flex items-center gap-1">
                      <Coffee className="w-2.5 h-2.5 text-amber-400" />
                      Break: {shift.lunchBreakMinutes} mins
                    </p>
                    <p className="truncate text-slate-400">
                      📍 {shift.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!shift.isOff && (
              <div className="pt-3 mt-3 border-t border-white/5">
                <button
                  onClick={() => handleRequestSwap(shift.dayName)}
                  className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 flex items-center justify-center gap-1 transition-all"
                >
                  <ArrowLeftRight className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Swap Shift</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
