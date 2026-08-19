"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Download,
  List,
  User as UserIcon,
  Clock as ClockIcon,
  MapPin,
  ChevronDown,
  Star,
  Calendar as CalendarIcon,
  Check,
  X,
  AlertTriangle,
  Plane,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";
import { useAppDispatch } from "@/redux/hooks";
import { fetchAttendanceAsync } from "@/redux/slices/attendanceSlice";

export default function AttendanceMatrixView() {
  const dispatch = useAppDispatch();
  const { employees, activeEmployee, setActiveEmployee, punchRecords } =
    useCustomerApp();

  const now = new Date();
  const currentDayNum = now.getDate();
  const currentMonthIdx = now.getMonth();
  const currentYearNum = now.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(currentMonthIdx);
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [viewMode, setViewMode] = useState<"matrix" | "cards" | "clock" | "map">(
    "matrix"
  );

  const selectedMonthName = monthNames[selectedMonthIdx];

  // 15-second polling to keep attendance records fresh
  useEffect(() => {
    if (!activeEmployee?.id) return;
    const pollInterval = setInterval(() => {
      dispatch(
        fetchAttendanceAsync({
          employeeId: activeEmployee.id,
          employeeCode: activeEmployee.employeeCode,
        })
      );
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [activeEmployee?.id, activeEmployee?.employeeCode, dispatch]);

  // Calculate days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonthIdx + 1, 0).getDate();

  // Calculate day names for the month
  const dayNames = useMemo(() => {
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(selectedYear, selectedMonthIdx, i + 1);
      return shortDays[d.getDay()];
    });
  }, [daysInMonth, selectedMonthIdx, selectedYear]);

  // Is the selected month the current month?
  const isCurrentMonth = selectedMonthIdx === currentMonthIdx && selectedYear === currentYearNum;

  // Build a map of day -> punch record for the selected month
  const dayPunchMap = useMemo(() => {
    const empId = activeEmployee?.id;
    if (!empId) return new Map<number, typeof punchRecords[0]>();

    const map = new Map<number, typeof punchRecords[0]>();
    punchRecords.forEach((p) => {
      const targetId = Number(String(p.employeeId).replace("emp_", ""));
      if (targetId !== Number(String(empId).replace("emp_", ""))) return;

      let recordDate: Date | null = null;
      if (p.date && p.date.includes("-")) {
        recordDate = new Date(p.date);
      } else if (p.date && p.date.includes("/")) {
        const parts = p.date.split("/");
        recordDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      if (!recordDate || isNaN(recordDate.getTime())) return;
      if (
        recordDate.getMonth() === selectedMonthIdx &&
        recordDate.getFullYear() === selectedYear
      ) {
        map.set(recordDate.getDate(), p);
      }
    });
    return map;
  }, [punchRecords, activeEmployee?.id, selectedMonthIdx, selectedYear]);

  // Determine status for each day
  const getDayStatus = (day: number): string => {
    // Future days in current month
    if (isCurrentMonth && day > currentDayNum) return "-";
    // Future months
    if (selectedYear > currentYearNum) return "-";
    if (selectedYear === currentYearNum && selectedMonthIdx > currentMonthIdx) return "-";

    // Check if Sunday (day off)
    const dayOfWeek = new Date(selectedYear, selectedMonthIdx, day).getDay();
    if (dayOfWeek === 0) return "✖️"; // Sunday / Day Off

    // Check punch record
    const punch = dayPunchMap.get(day);
    if (punch) {
      switch (punch.status) {
        case "Present": return "✔️";
        case "Late": return "⚠️";
        case "Half Day": return "🌟";
        case "Absent": return "✖️";
        case "On Leave": return "✈️";
        case "Holiday": return "⭐";
        case "Day Off": return "📅";
        default: return "✔️";
      }
    }

    // Past day with no record = absent (unless Sunday already handled)
    if (isCurrentMonth && day < currentDayNum) return "✖️";
    if (!isCurrentMonth && (selectedYear < currentYearNum || selectedMonthIdx < currentMonthIdx)) return "✖️";

    return "-";
  };

  const calculateTotalPresent = () => {
    let count = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const status = getDayStatus(i);
      if (status === "✔️" || status === "⚠️" || status === "🌟") count++;
    }
    return count;
  };

  const handleExport = () => {
    const header = "Employee,Role," + Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`).join(",") + ",Total";
    const row = `${activeEmployee.fullName},${activeEmployee.designation},` +
      Array.from({ length: daysInMonth }, (_, i) => getDayStatus(i + 1)).join(",") +
      `,${calculateTotalPresent()} / ${daysInMonth}`;
    
    const csvContent = "data:text/csv;charset=utf-8," + [header, row].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${selectedMonthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Available years for selector
  const yearOptions = [currentYearNum - 1, currentYearNum, currentYearNum + 1];

  return (
    <div className="space-y-4">
      {/* 1. Filter Bar Strip */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center divide-x divide-slate-200 text-xs">
          {/* Employee Selector */}
          <div className="flex items-center gap-2 pr-4">
            <span className="text-slate-500 font-medium">Employee</span>
            <div className="relative inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/80 cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                {activeEmployee.fullName.charAt(0)}
              </div>
              <span className="font-semibold text-slate-800">
                Mr {activeEmployee.fullName}
              </span>
              <span className="bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                It's You
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 px-4">
            <span className="text-slate-500 font-medium">Month</span>
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="font-bold text-slate-800 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2 pl-4">
            <span className="text-slate-500 font-medium">Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="font-bold text-slate-800 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Action Bar: Export Button (Left) & View Mode Selector (Right) */}
      <div className="flex items-center justify-between">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export</span>
        </button>

        {/* View Mode Segment */}
        <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs overflow-hidden">
          <button
            onClick={() => setViewMode("matrix")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "matrix"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Matrix View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "cards"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Profile Cards"
          >
            <UserIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("clock")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "clock"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Timeline Logs"
          >
            <ClockIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "map"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Geofence Map"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Main Card with Legend & Attendance Matrix */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
        {/* Note / Legend Bar */}
        <div className="text-xs text-slate-700 font-medium flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-2">
          <span className="font-bold text-slate-900">Note:</span>
          <span className="flex items-center gap-1">
            <span>⭐ ➔ Holiday</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span>📅 ➔ Day Off</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-600 font-bold">✔️ ➔ Present</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">🌟 ➔ Half Day</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-amber-600">⚠️ ➔ Late</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">✖️ ➔ Absent</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-rose-500">✈️ ➔ On Leave</span>
          </span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header: Days 1 to N */}
            <thead>
              <tr className="bg-[#f0f4f9] text-slate-600 border-b border-slate-200">
                <th className="py-2 px-3 font-semibold text-slate-700 whitespace-nowrap min-w-[170px] sticky left-0 bg-[#f0f4f9] z-10">
                  Employee
                </th>
                {Array.from({ length: daysInMonth }, (_, idx) => {
                  const dayNum = idx + 1;
                  const dayName = dayNames[idx];
                  const isToday = isCurrentMonth && dayNum === currentDayNum;
                  return (
                    <th
                      key={dayNum}
                      className={`py-2 px-1 text-center font-medium min-w-[28px] border-l border-slate-200/60 ${
                        isToday ? "bg-blue-50 text-blue-700 font-bold" : ""
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-none">{dayNum}</div>
                      <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                        {dayName}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2 px-3 text-center font-bold text-slate-800 border-l border-slate-200 min-w-[65px]">
                  Total
                </th>
              </tr>
            </thead>

            {/* Body: Employee Row */}
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="hover:bg-slate-50/60 transition-colors">
                {/* Employee Info Cell */}
                <td className="py-3 px-3 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-200/60 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 overflow-hidden">
                      {activeEmployee?.avatarUrl ? (
                        <img
                          src={activeEmployee.avatarUrl}
                          alt={activeEmployee.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeEmployee.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 text-xs">
                          {activeEmployee.fullName}
                        </span>
                        <span className="bg-slate-700 text-white text-[8px] font-bold px-1 rounded">
                          It's You
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {activeEmployee.designation}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Days Cells (1 to N) */}
                {Array.from({ length: daysInMonth }, (_, idx) => {
                  const dayNum = idx + 1;
                  const status = getDayStatus(dayNum);
                  const isToday = isCurrentMonth && dayNum === currentDayNum;

                  return (
                    <td
                      key={dayNum}
                      className={`py-3 px-1 text-center font-mono border-l border-slate-100 text-xs ${
                        isToday ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {status === "✔️" ? (
                        <span className="text-emerald-600 font-bold">✔️</span>
                      ) : status === "⚠️" ? (
                        <span className="text-amber-600 font-bold">⚠️</span>
                      ) : status === "🌟" ? (
                        <span className="text-amber-500 font-bold">🌟</span>
                      ) : status === "✈️" ? (
                        <span className="text-rose-500 font-bold">✈️</span>
                      ) : status === "⭐" ? (
                        <span className="text-yellow-500 font-bold">⭐</span>
                      ) : status === "📅" ? (
                        <span className="text-blue-400 font-bold">📅</span>
                      ) : status === "✖️" ? (
                        <span className="text-slate-400 font-bold">✖️</span>
                      ) : (
                        <span className="text-slate-300 font-bold">-</span>
                      )}
                    </td>
                  );
                })}

                {/* Total Column */}
                <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono text-xs border-l border-slate-200 bg-slate-50/40">
                  {calculateTotalPresent()} / {daysInMonth}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
