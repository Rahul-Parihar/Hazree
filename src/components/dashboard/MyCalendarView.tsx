"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  X,
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";

interface CalendarEvent {
  id: string;
  day: number;
  time?: string;
  title: string;
  type: "task" | "leave" | "halfday" | "alert" | "event";
  color?: string;
}

export default function MyCalendarView() {
  const { activeEmployee } = useCustomerApp();
  const [selectedType, setSelectedType] = useState("All");
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "list">("month");
  const [currentMonthYear, setCurrentMonthYear] = useState("August 2026");

  // Sample calendar events matching the screenshot
  const events: Record<number, CalendarEvent[]> = {
    // Previous month overlap: July 27-31
    "-4": [{ id: "p1", day: 27, time: "6:37 AM", title: "Lab details page", type: "task" }],
    "-3": [
      { id: "p2", day: 28, time: "5:09 AM", title: "Doctor detail bad", type: "task" },
      { id: "p3", day: 28, time: "8:44 AM", title: "Healthkeyz lab", type: "task" },
    ],
    "-2": [
      { id: "p4", day: 29, time: "5:05 AM", title: "cashe issue in h", type: "task" },
      { id: "p5", day: 29, time: "5:59 AM", title: "git push and sh", type: "task" },
      { id: "p6", day: 29, time: "1:26 PM", title: "fair ride setup an", type: "task" },
    ],
    "-1": [
      { id: "p7", day: 30, time: "5:39 AM", title: "Some part Remo", type: "task" },
      { id: "p8", day: 30, time: "6:56 AM", title: "Bizzjob app test", type: "task" },
      { id: "p9", day: 30, time: "11:31 AM", title: "Healthkeyz UI u", type: "task" },
    ],
    "0": [{ id: "p10", day: 31, time: "4:40 AM", title: "UI Inhance bizzj", type: "task" }],

    // August Days
    1: [{ id: "e1", day: 1, time: "5:01 AM", title: "Bizzjob admn ba", type: "task" }],
    2: [],
    3: [
      { id: "e2", day: 3, title: "Sanskar Jaiswal", type: "leave", color: "purple" },
      { id: "e3", day: 3, title: "( HalfDay ) Shubham Parmar", type: "halfday", color: "green" },
    ],
    4: [],
    5: [
      { id: "e4", day: 5, time: "5:16 AM", title: "ios publish ringt", type: "task" },
      { id: "e5", day: 5, time: "12:44 PM", title: "search data city", type: "task" },
      { id: "e6", day: 5, time: "12:44 PM", title: "inhance lab details new pages", type: "task" },
    ],
    6: [
      { id: "e7", day: 6, time: "8:45 AM", title: "Faciliteies image", type: "task" },
      { id: "e8", day: 6, time: "11:13 AM", title: "Rinttone insert ringtone admin panel", type: "task" },
    ],
    7: [{ id: "e9", day: 7, time: "4:54 AM", title: "making api in ba", type: "task" }],
    8: [
      { id: "e10", day: 8, time: "6:22 AM", title: "hospital checking", type: "task" },
      { id: "e11", day: 8, time: "10:51 AM", title: "ringtone shuffle", type: "task" },
    ],
    9: [],
    10: [
      { id: "e12", day: 10, time: "5:06 AM", title: "bizzjob app repu", type: "task" },
      { id: "e13", day: 10, time: "6:13 AM", title: "register your sel", type: "task" },
      { id: "e14", day: 10, time: "11:06 AM", title: "Clinic module t", type: "alert" },
    ],
    11: [
      { id: "e15", day: 11, time: "5:23 AM", title: "show avaliable b", type: "task" },
      { id: "e16", day: 11, time: "9:43 AM", title: "rington shuffle a", type: "task" },
    ],
    12: [{ id: "e17", day: 12, time: "6:44 AM", title: "splash screen in", type: "task" }],
    13: [
      { id: "e18", day: 13, time: "4:58 AM", title: "Facebook sdk ri", type: "task" },
      { id: "e19", day: 13, time: "12:13 PM", title: "helathkeyz doc", type: "task" },
    ],
    14: [
      { id: "e20", day: 14, time: "5:12 AM", title: "ringtrone shuffle", type: "task" },
      { id: "e21", day: 14, time: "6:44 AM", title: "bizzjob inhance", type: "task" },
      { id: "e22", day: 14, time: "9:43 AM", title: "Document updat", type: "task" },
    ],
    15: [
      { id: "e23", day: 15, time: "8:00 AM", title: "ringtone shuffle", type: "task" },
      { id: "e24", day: 15, time: "8:50 AM", title: "bizz reels page q", type: "task" },
    ],
    16: [],
    17: [{ id: "e25", day: 17, time: "5:34 AM", title: "bizzjob google a", type: "task" }],
  };

  // 35-day grid structure (August 2026: starts on Sat, Aug 1; previous Mon was July 27)
  // Weeks:
  // Week 1: 27 (Mon), 28, 29, 30, 31 (Jul) | 1, 2 (Aug)
  // Week 2: 3, 4, 5, 6, 7, 8, 9
  // Week 3: 10, 11, 12, 13, 14, 15, 16
  // Week 4: 17, 18, 19, 20, 21, 22, 23
  // Week 5: 24, 25, 26, 27, 28, 29, 30
  // Week 6: 31, 1, 2, 3, 4, 5, 6 (Sep)

  const calendarGrid = [
    // Week 1
    { day: 27, isCurrentMonth: false, eventKey: -4 },
    { day: 28, isCurrentMonth: false, eventKey: -3 },
    { day: 29, isCurrentMonth: false, eventKey: -2 },
    { day: 30, isCurrentMonth: false, eventKey: -1 },
    { day: 31, isCurrentMonth: false, eventKey: 0 },
    { day: 1, isCurrentMonth: true, eventKey: 1 },
    { day: 2, isCurrentMonth: true, eventKey: 2 },
    // Week 2
    { day: 3, isCurrentMonth: true, eventKey: 3 },
    { day: 4, isCurrentMonth: true, eventKey: 4 },
    { day: 5, isCurrentMonth: true, eventKey: 5 },
    { day: 6, isCurrentMonth: true, eventKey: 6 },
    { day: 7, isCurrentMonth: true, eventKey: 7 },
    { day: 8, isCurrentMonth: true, eventKey: 8 },
    { day: 9, isCurrentMonth: true, eventKey: 9 },
    // Week 3
    { day: 10, isCurrentMonth: true, eventKey: 10 },
    { day: 11, isCurrentMonth: true, eventKey: 11 },
    { day: 12, isCurrentMonth: true, eventKey: 12 },
    { day: 13, isCurrentMonth: true, eventKey: 13 },
    { day: 14, isCurrentMonth: true, eventKey: 14 },
    { day: 15, isCurrentMonth: true, eventKey: 15 },
    { day: 16, isCurrentMonth: true, eventKey: 16 },
    // Week 4
    { day: 17, isCurrentMonth: true, eventKey: 17, isToday: true },
    { day: 18, isCurrentMonth: true, eventKey: 18 },
    { day: 19, isCurrentMonth: true, eventKey: 19 },
    { day: 20, isCurrentMonth: true, eventKey: 20 },
    { day: 21, isCurrentMonth: true, eventKey: 21 },
    { day: 22, isCurrentMonth: true, eventKey: 22 },
    { day: 23, isCurrentMonth: true, eventKey: 23 },
    // Week 5
    { day: 24, isCurrentMonth: true, eventKey: 24 },
    { day: 25, isCurrentMonth: true, eventKey: 25 },
    { day: 26, isCurrentMonth: true, eventKey: 26 },
    { day: 27, isCurrentMonth: true, eventKey: 27 },
    { day: 28, isCurrentMonth: true, eventKey: 28 },
    { day: 29, isCurrentMonth: true, eventKey: 29 },
    { day: 30, isCurrentMonth: true, eventKey: 30 },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Type Selector Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Type</span>
          <div className="relative inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-medium cursor-pointer">
            <span>{selectedType}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Main Calendar Container Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
        {/* Navigation Header: Prev / Next / Today (Left) | Title (Center) | View Switcher (Right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100">
          {/* Left Buttons */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-white border border-slate-300 rounded-md shadow-xs overflow-hidden">
              <button
                onClick={() => {}}
                className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {}}
                className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {}}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-600 shadow-xs transition-colors"
            >
              today
            </button>
          </div>

          {/* Center Month Title */}
          <h3 className="font-bold text-sm sm:text-base text-slate-800 tracking-tight">
            {currentMonthYear}
          </h3>

          {/* Right View Mode Switcher */}
          <div className="flex items-center bg-white border border-slate-300 rounded-md p-0.5 shadow-xs overflow-hidden text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "month"
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "week"
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "day"
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              day
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              list
            </button>
          </div>
        </div>

        {/* 3. Monthly Calendar Matrix Grid */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Weekday Header Row */}
          <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 text-center text-xs font-semibold text-slate-700 py-2.5">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/80 bg-white">
            {calendarGrid.map((cell, idx) => {
              const dayEvents = events[cell.eventKey] || [];

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[125px] p-1.5 flex flex-col justify-between transition-colors hover:bg-slate-50/40 ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/30 text-slate-300"
                      : "text-slate-700"
                  } ${cell.isToday ? "bg-blue-50/20 ring-1 ring-inset ring-blue-400/30" : ""}`}
                >
                  {/* Top Day Number */}
                  <div className="flex justify-end pr-1">
                    <span
                      className={`text-xs font-bold font-mono ${
                        cell.isToday
                          ? "w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center -mr-1 -mt-0.5 text-[10px]"
                          : cell.isCurrentMonth
                          ? "text-slate-600"
                          : "text-slate-300"
                      }`}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Day Events Stack */}
                  <div className="flex-1 space-y-1 mt-1 overflow-hidden">
                    {dayEvents.map((evt) => {
                      if (evt.type === "leave") {
                        return (
                          <div
                            key={evt.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#a855f7] text-white truncate shadow-xs"
                          >
                            {evt.title}
                          </div>
                        );
                      }
                      if (evt.type === "halfday") {
                        return (
                          <div
                            key={evt.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#10b981] text-white truncate shadow-xs"
                          >
                            {evt.title}
                          </div>
                        );
                      }
                      if (evt.type === "alert") {
                        return (
                          <div
                            key={evt.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eab308] text-slate-900 truncate shadow-xs flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0"></span>
                            <span className="truncate">{evt.time} {evt.title}</span>
                          </div>
                        );
                      }

                      // Standard Dark Pill Event (matching screenshot)
                      return (
                        <div
                          key={evt.id}
                          className="px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-[#111622] text-white truncate shadow-xs flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] shrink-0"></span>
                          <span className="truncate">
                            <strong className="font-mono text-slate-200">{evt.time}</strong> {evt.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* Show '+1 more' on day 4 if needed */}
                    {cell.eventKey === 4 && (
                      <span className="text-[10px] font-semibold text-[#1a73e8] cursor-pointer hover:underline pl-0.5">
                        +1 more
                      </span>
                    )}
                    {cell.eventKey === 3 && dayEvents.length > 2 && (
                      <span className="text-[10px] font-semibold text-[#1a73e8] cursor-pointer hover:underline pl-0.5">
                        +3 more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
