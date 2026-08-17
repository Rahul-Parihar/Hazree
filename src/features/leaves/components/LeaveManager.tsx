"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Send,
  AlertCircle,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";

export default function LeaveManager() {
  const { activeEmployee, leaveBalance, leaveRequests, applyLeave } = useCustomerApp();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<"Casual" | "Sick" | "Earned" | "Unpaid">("Casual");
  const [startDate, setStartDate] = useState<string>("2026-08-25");
  const [endDate, setEndDate] = useState<string>("2026-08-26");
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [halfDaySession, setHalfDaySession] = useState<"Morning" | "Afternoon">("Morning");
  const [reason, setReason] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Please enter a valid reason for the leave application.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setErrorMsg("End date cannot be prior to start date.");
      return;
    }

    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    const count = isHalfDay ? 0.5 : diffDays;

    applyLeave({
      leaveType,
      startDate,
      endDate,
      daysCount: count,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason,
    });

    setReason("");
    setErrorMsg("");
    setShowModal(false);
  };

  const getStatusPill = (status: "Pending" | "Approved" | "Rejected") => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Apply Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-white">Leave Quota & Applications</h3>
          <p className="text-xs text-slate-400">
            Apply for planned time-off and track approval status
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Casual Leave (CL)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total: {leaveBalance.casual.total}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {leaveBalance.casual.remaining}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{
                width: `${(leaveBalance.casual.remaining / leaveBalance.casual.total) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Used: {leaveBalance.casual.used} days this year
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Sick Leave (SL)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total: {leaveBalance.sick.total}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {leaveBalance.sick.remaining}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all"
              style={{
                width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Used: {leaveBalance.sick.used} days this year
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400">Earned / Privilege (EL)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Total: {leaveBalance.earned.total}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {leaveBalance.earned.remaining}
            </span>
            <span className="text-xs text-slate-400">Days Available</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full transition-all"
              style={{
                width: `${(leaveBalance.earned.remaining / leaveBalance.earned.total) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Used: {leaveBalance.earned.used} days this year
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-xl space-y-4">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>My Leave Applications & History</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">Dates</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3">Reason</th>
                <th className="pb-3 px-3">Applied On</th>
                <th className="pb-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {req.leaveType} Leave
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-300 font-medium">
                      {req.daysCount} {req.daysCount === 1 ? "Day" : "Days"}
                      {req.isHalfDay ? ` (${req.halfDaySession})` : ""}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {req.appliedOn}
                    </td>
                    <td className="py-3 px-3">{getStatusPill(req.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Apply for Leave</h3>
                <p className="text-xs text-slate-400">
                  {activeEmployee.fullName} • {activeEmployee.employeeCode}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Casual">Casual Leave (Remaining: {leaveBalance.casual.remaining})</option>
                  <option value="Sick">Sick Leave (Remaining: {leaveBalance.sick.remaining})</option>
                  <option value="Earned">Earned / Privilege (Remaining: {leaveBalance.earned.remaining})</option>
                  <option value="Unpaid">Unpaid Leave (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(e) => setIsHalfDay(e.target.checked)}
                    className="rounded bg-slate-800 border-white/20 text-emerald-500"
                  />
                  <span>Half Day Leave</span>
                </label>

                {isHalfDay && (
                  <select
                    value={halfDaySession}
                    onChange={(e: any) => setHalfDaySession(e.target.value)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-200 outline-none"
                  >
                    <option value="Morning">First Half (Morning)</option>
                    <option value="Afternoon">Second Half (Afternoon)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Urgent family work, doctor appointment, out of station..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-emerald-500"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
