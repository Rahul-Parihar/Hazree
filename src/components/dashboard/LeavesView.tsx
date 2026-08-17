"use client";

import React, { useState } from "react";
import {
  Plus,
  Download,
  Search,
  Filter,
  List,
  Calendar as CalendarIcon,
  User as UserIcon,
  MoreVertical,
  ChevronDown,
  X,
  CheckCircle2,
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";

interface LeaveEntry {
  id: string;
  employeeName: string;
  role: string;
  isYou: boolean;
  leaveDate: string;
  duration: string;
  durationBadge?: string;
  status: "Pending" | "Approved" | "Rejected";
  leaveType: "monthly leaves" | "Sick" | "Casual" | "Earned";
  leaveSubType?: string;
  isPaid: boolean;
}

export default function LeavesView() {
  const { activeEmployee, applyLeave } = useCustomerApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "cards">("table");

  // Form state for New Leave modal
  const [newLeaveType, setNewLeaveType] = useState<"Casual" | "Sick" | "Earned">("Casual");
  const [newLeaveDuration, setNewLeaveDuration] = useState<"Full Day" | "Half Day" | "Multiple">("Full Day");
  const [newLeaveDate, setNewLeaveDate] = useState<string>("2026-08-28");
  const [newLeaveReason, setNewLeaveReason] = useState<string>("");

  const [leavesList, setLeavesList] = useState<LeaveEntry[]>([
    {
      id: "1",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "27-08-2026 (Thursday)",
      duration: "Full Day",
      status: "Pending",
      leaveType: "monthly leaves",
      isPaid: false,
    },
    {
      id: "2",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "01-08-2026 (Saturday)",
      duration: "Half Day",
      status: "Pending",
      leaveType: "monthly leaves",
      leaveSubType: "Second Half",
      isPaid: false,
    },
    {
      id: "3",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "10-07-2026 (Friday)",
      duration: "Full Day",
      status: "Pending",
      leaveType: "Sick",
      isPaid: false,
    },
    {
      id: "4",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "04-07-2026 (Saturday)",
      duration: "Half Day",
      status: "Pending",
      leaveType: "Casual",
      leaveSubType: "Second Half",
      isPaid: false,
    },
    {
      id: "5",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "16-06-2026 (Tuesday)",
      duration: "Half Day",
      status: "Approved",
      leaveType: "Casual",
      leaveSubType: "Second Half",
      isPaid: false,
    },
    {
      id: "6",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "06-06-2026 (Saturday)",
      duration: "Half Day",
      status: "Approved",
      leaveType: "Casual",
      leaveSubType: "Second Half",
      isPaid: false,
    },
    {
      id: "7",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "27-05-2026 (Wednesday)",
      duration: "Full Day",
      status: "Pending",
      leaveType: "Sick",
      isPaid: false,
    },
    {
      id: "8",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "04-05-2026 (Monday)",
      duration: "Multiple",
      durationBadge: "7 Days",
      status: "Pending",
      leaveType: "Casual",
      isPaid: false,
    },
    {
      id: "9",
      employeeName: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      leaveDate: "02-10-2025 (Thursday)",
      duration: "Full Day",
      status: "Pending",
      leaveType: "Casual",
      isPaid: false,
    },
  ]);

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = `${newLeaveDate} (${new Date(newLeaveDate).toLocaleDateString("en-US", { weekday: "long" })})`;
    const newEntry: LeaveEntry = {
      id: String(Date.now()),
      employeeName: `Mr ${activeEmployee.fullName}`,
      role: activeEmployee.designation,
      isYou: true,
      leaveDate: formattedDate,
      duration: newLeaveDuration,
      status: "Pending",
      leaveType: newLeaveType,
      isPaid: false,
    };

    setLeavesList([newEntry, ...leavesList]);
    applyLeave({
      leaveType: newLeaveType,
      fromDate: newLeaveDate,
      toDate: newLeaveDate,
      reason: newLeaveReason,
    });
    setIsApplyModalOpen(false);
  };

  const handleExport = () => {
    const header = "Employee,Role,Leave Date,Duration,Status,Leave Type,Paid Status";
    const rows = leavesList.map(
      (l) => `"${l.employeeName}","${l.role}","${l.leaveDate}","${l.duration}","${l.status}","${l.leaveType}","${l.isPaid ? "Paid" : "Unpaid"}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leaves_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeaves = leavesList.filter((leave) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      leave.leaveDate.toLowerCase().includes(q) ||
      leave.leaveType.toLowerCase().includes(q) ||
      leave.status.toLowerCase().includes(q) ||
      leave.duration.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* 1. Search & Filter Bar Strip */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Duration Date Range */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Duration</span>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="Start Date To End Date"
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-48"
            />
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing to search"
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-60"
            />
          </div>
        </div>

        {/* Filters Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* 2. Action Bar: + New Leave & Export (Left), View Switcher (Right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* New Leave Button */}
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Leave</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export</span>
          </button>
        </div>

        {/* View Mode Segment */}
        <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="List Table"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "calendar"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Calendar View"
          >
            <CalendarIcon className="w-4 h-4" />
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
        </div>
      </div>

      {/* 3. Main Leaves Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Leave Date</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Leave Status</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredLeaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Employee Info */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 overflow-hidden">
                        {activeEmployee?.avatarUrl ? (
                          <img
                            src={activeEmployee.avatarUrl}
                            alt={item.employeeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.employeeName.charAt(3)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 text-xs">
                            {item.employeeName}
                          </span>
                          {item.isYou && (
                            <span className="bg-slate-700 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                              It's you
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Leave Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                    {item.leaveDate}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{item.duration}</span>
                      {item.durationBadge && (
                        <span className="bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          {item.durationBadge}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Leave Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.status === "Approved"
                            ? "bg-emerald-500"
                            : item.status === "Pending"
                            ? "bg-amber-400"
                            : "bg-rose-500"
                        }`}
                      ></span>
                      <span
                        className={
                          item.status === "Approved"
                            ? "text-slate-800"
                            : "text-slate-800"
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                  </td>

                  {/* Leave Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.leaveType === "monthly leaves"
                            ? "bg-[#1b4d3e] text-white"
                            : item.leaveType === "Sick"
                            ? "bg-[#d32f2f] text-white"
                            : "bg-[#2e7d32] text-white"
                        }`}
                      >
                        {item.leaveType}
                      </span>
                      {item.leaveSubType && (
                        <span className="text-[11px] font-medium text-slate-600">
                          {item.leaveSubType}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Paid Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isPaid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#d32f2f] text-white"
                      }`}
                    >
                      {item.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>

                  {/* Action Menu */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Show Entries & Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Showing 1 to {filteredLeaves.length} of {filteredLeaves.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-[#1a73e8] text-white font-bold rounded">
                1
              </button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply New Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Apply New Leave</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Leave Type
                </label>
                <select
                  value={newLeaveType}
                  onChange={(e: any) => setNewLeaveType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Casual">Casual Leave (CL)</option>
                  <option value="Sick">Sick Leave (SL)</option>
                  <option value="Earned">Earned Leave (EL)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration
                </label>
                <select
                  value={newLeaveDuration}
                  onChange={(e: any) => setNewLeaveDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Multiple">Multiple Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Leave Date
                </label>
                <input
                  type="date"
                  required
                  value={newLeaveDate}
                  onChange={(e) => setNewLeaveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  required
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="Provide reason for leave application..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
