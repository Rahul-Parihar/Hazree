'use client';

import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Briefcase,
  User,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../../types';
import { Badge } from '../ui/Badge';

interface EmployeeAttendanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  employee?: Employee | null;
  allEmployeeRecords?: AttendanceRecord[];
}

/**
 * Helper to calculate working duration between check-in and check-out
 */
function calculateWorkDuration(checkIn?: string, checkOut?: string): string {
  if (!checkIn || !checkOut || checkIn === '--' || checkOut === '--') {
    return 'Active Session (Pending Clock-Out)';
  }
  const parseTimeToMinutes = (t: string) => {
    const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };
  const inMin = parseTimeToMinutes(checkIn);
  const outMin = parseTimeToMinutes(checkOut);
  if (inMin === null || outMin === null) return '--';
  let diff = outMin - inMin;
  if (diff < 0) diff += 24 * 60; // Overnight shift handle
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hrs} hrs ${mins > 0 ? `${mins} mins` : ''}`;
}

export const EmployeeAttendanceDrawer: React.FC<EmployeeAttendanceDrawerProps> = ({
  isOpen,
  onClose,
  record,
  employee,
  allEmployeeRecords = [],
}) => {
  if (!isOpen || !record) return null;

  const checkIn = record.checkInTime || record.checkIn || '--';
  const checkOut = record.checkOutTime || record.checkOut || '--';
  const isClockedIn = checkIn && checkIn !== '--';
  const isClockedOut = checkOut && checkOut !== '--';
  const isLate = record.status === 'Late';
  const duration = calculateWorkDuration(checkIn, checkOut);

  // Filter history records for this specific employee (excluding current record)
  const historyLogs = allEmployeeRecords
    .filter(
      (r) =>
        r.id !== record.id &&
        (r.employeeId === record.employeeId ||
          r.employeeName.toLowerCase() === record.employeeName.toLowerCase())
    )
    .slice(0, 5);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Attendance Session Details</h3>
              <p className="text-[11px] text-slate-500 font-mono">Date: {record.date || 'Today'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Employee Identity Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative shrink-0">
                <img
                  src={
                    record.employeeAvatar ||
                    employee?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(record.employeeName)}&background=059669&color=fff`
                  }
                  alt={record.employeeName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-xs"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    isClockedOut ? 'bg-emerald-400' : isClockedIn ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'
                  }`}
                  title={isClockedOut ? 'Shift Completed' : 'Session Active'}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white truncate">{record.employeeName}</h4>
                  <Badge
                    variant={
                      record.status === 'Present'
                        ? 'present'
                        : record.status === 'Late'
                        ? 'late'
                        : 'neutral'
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {employee?.role || record.department}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                  <span>ID: {record.employeeId}</span>
                  <span>•</span>
                  <span>{record.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clock In / Clock Out Timeline Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Punch Timeline & Shift Status</span>
            </h5>

            <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4">
              {/* Step 1: Clock In */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">Clock In (Shift Start)</span>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {checkIn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{record.location || 'Office Premises (Verified)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                    <Smartphone className="w-3 h-3 shrink-0" />
                    <span>{record.device || 'Verified Punch'}</span>
                    {isLate && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 ml-1">
                        Late Arrival
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Connector Duration */}
              <div className="pl-4 py-1 flex items-center gap-2 border-l-2 border-dashed border-slate-300 ml-3.5">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                  ⏱️ Session Duration: <strong>{duration}</strong>
                </span>
              </div>

              {/* Step 2: Clock Out */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                    isClockedOut
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-amber-100 text-amber-700 animate-pulse'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">Clock Out (Shift End)</span>
                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
                        isClockedOut
                          ? 'text-purple-700 bg-purple-50 border-purple-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {checkOut}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isClockedOut
                      ? 'Shift completed & verified. Clock-in closed for this date.'
                      : 'Session active. Automatic auto-close at shift end or manual clock out.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Shift Information */}
          {employee?.assignedShift && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                    Official Assigned Shift
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {employee.assignedShift}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Historical Logs For this Employee */}
          {historyLogs.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Previous Logs for {record.employeeName}
              </h5>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {historyLogs.map((h) => (
                  <div key={h.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block font-mono text-[11px]">{h.date}</span>
                      <span className="text-[11px] text-slate-500">
                        In: {h.checkInTime || h.checkIn || '--'} • Out: {h.checkOutTime || h.checkOut || '--'}
                      </span>
                    </div>
                    <Badge variant={h.status === 'Present' ? 'present' : h.status === 'Late' ? 'late' : 'neutral'}>
                      {h.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Status: <strong>{isClockedOut ? 'Shift Completed' : 'Clocked In'}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );
};
