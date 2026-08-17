"use client";

import React, { useState } from "react";

export default function WeekTimelogsWidget() {
  const [selectedDay, setSelectedDay] = useState("Mo");

  const days = [
    { id: "Mo", label: "Mo", active: true },
    { id: "Tu", label: "Tu", active: false },
    { id: "We", label: "We", active: false },
    { id: "Th", label: "Th", active: false },
    { id: "Fr", label: "Fr", active: false },
    { id: "Sa", label: "Sa", active: false },
    { id: "Su", label: "Su", active: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
      {/* Header with badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-800 tracking-tight">
          Week Timelogs
        </h3>
        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          2h 28m This Week
        </span>
      </div>

      {/* Day Pills */}
      <div className="flex items-center gap-2 pt-1">
        {days.map((day) => {
          const isSelected = selectedDay === day.id;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
        <div className="bg-[#1a73e8] h-full w-[35%] rounded-full transition-all"></div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Duration: 2h 28m</span>
        <span>Break: 0s</span>
      </div>
    </div>
  );
}
