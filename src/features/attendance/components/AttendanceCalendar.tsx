"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Filter,
  Download,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { AttendanceStatus } from "@/types/customer";
import { useCustomerApp } from "@/context/CustomerAppContext";

export default function AttendanceCalendar() {
  const { punchRecords, activeEmployee } = useCustomerApp();
  const [selectedMonth] = useState<string>("August 2026");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const myPunches = punchRecords.filter((r) => r.employeeId === activeEmployee.id);

  const filteredRecords = myPunches.filter((record) => {
    if (statusFilter === "All") return true;
    return record.status === statusFilter;
  });

  const presentCount = myPunches.filter((r) => r.status === "Present").length;
  const lateCount = myPunches.filter((r) => r.status === "Late").length;
  const halfDayCount = myPunches.filter((r) => r.status === "Half Day").length;
  const totalHours = myPunches
    .reduce((acc, curr) => acc + (curr.workHours || 0), 0)
    .toFixed(1);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Late":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Half Day":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "Absent":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "Holiday":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "On Leave":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Day Off":
        return "bg-slate-700/40 text-slate-400 border-slate-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Punch In,Punch Out,Status,Work Hours,Location,Type"]
        .concat(
          filteredRecords.map(
            (r) =>
              `${r.date},${r.punchInTime},${r.punchOutTime || "--"},${r.status},${
                r.workHours
              } hrs,${r.punchLocation || "Office"},${r.punchType}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hazree_Attendance_${selectedMonth.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Present Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{presentCount}</p>
          <p className="text-[11px] text-slate-400">On-time attendances</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Late Marks</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{lateCount}</p>
          <p className="text-[11px] text-slate-400">Within grace window</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Half Days</span>
            <AlertCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 font-mono">{halfDayCount}</p>
          <p className="text-[11px] text-slate-400">Under standard hours</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Logged Hours</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 font-mono">{totalHours}h</p>
          <p className="text-[11px] text-slate-400">Total verified duty</p>
        </div>
      </div>

      {/* Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Monthly Attendance & Punch Logs
              </h3>
              <p className="text-xs text-slate-400">
                Audit trail for {activeEmployee.fullName} • {selectedMonth}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                <option value="Present" className="bg-slate-900 text-emerald-400">Present</option>
                <option value="Late" className="bg-slate-900 text-amber-400">Late</option>
                <option value="Half Day" className="bg-slate-900 text-indigo-400">Half Day</option>
                <option value="Holiday" className="bg-slate-900 text-cyan-400">Holiday</option>
                <option value="Day Off" className="bg-slate-900 text-slate-400">Day Off</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Punch In</th>
                <th className="pb-3 px-3">Punch Out</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Duty Hours</th>
                <th className="pb-3 px-3">Geofence / Location</th>
                <th className="pb-3 px-3">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white font-mono">
                      {record.date}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-300">
                      {record.punchInTime === "00:00:00" ? "--" : record.punchInTime}
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-300">
                      {record.punchOutTime || "--:--:--"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-100">
                      {record.workHours > 0 ? `${record.workHours} hrs` : "-"}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{record.punchLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-white/5">
                        {record.punchType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
