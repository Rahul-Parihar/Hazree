'use client';

import React from 'react';
import { UserCheck, UserPlus, FileDown, CalendarCheck, MapPin, Shield } from 'lucide-react';
import Link from 'next/link';

import { useAppSelector } from '../../redux/hooks';

interface CompanyQuickActionsProps {
  onOpenManualPunch: () => void;
  onOpenAddEmployee?: () => void;
}

export const CompanyQuickActions: React.FC<CompanyQuickActionsProps> = ({
  onOpenManualPunch,
  onOpenAddEmployee,
}) => {
  const leaves = useAppSelector((state) => state.leaves?.leaves || []);
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Mark Manual Punch */}
      <button
        onClick={onOpenManualPunch}
        className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-all group flex flex-col justify-between cursor-pointer"
      >
        <div className="p-2.5 w-fit rounded-xl bg-emerald-600 text-white group-hover:scale-110 transition-transform shadow-sm">
          <UserCheck className="w-4 h-4" />
        </div>
        <div className="mt-3">
          <p className="font-bold text-xs text-slate-900">Mark Manual Hazree</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Punch in / out override</p>
        </div>
      </button>

      {/* 2. Approve Leaves */}
      <Link
        href="/leaves"
        className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-left transition-all group flex flex-col justify-between"
      >
        <div className="p-2.5 w-fit rounded-xl bg-indigo-600 text-white group-hover:scale-110 transition-transform shadow-sm flex items-center gap-1">
          <CalendarCheck className="w-4 h-4" />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xs text-slate-900">Leave Approvals</p>
            {pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingLeavesCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {pendingLeavesCount > 0 ? `${pendingLeavesCount} pending employee request${pendingLeavesCount > 1 ? 's' : ''}` : 'No pending requests'}
          </p>
        </div>
      </Link>

      {/* 3. Export Monthly Payroll */}
      <button
        onClick={() => alert('Exporting monthly attendance log in Excel/CSV...')}
        className="p-4 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-left transition-all group flex flex-col justify-between"
      >
        <div className="p-2.5 w-fit rounded-xl bg-sky-600 text-white group-hover:scale-110 transition-transform shadow-sm">
          <FileDown className="w-4 h-4" />
        </div>
        <div className="mt-3">
          <p className="font-bold text-xs text-slate-900">Export Attendance CSV</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Monthly payroll log download</p>
        </div>
      </button>

      {/* 4. Add Employee */}
      {onOpenAddEmployee ? (
        <button
          onClick={onOpenAddEmployee}
          className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 w-fit rounded-xl bg-amber-500 text-white group-hover:scale-110 transition-transform shadow-sm">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="font-bold text-xs text-slate-900">Add New Staff</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Register employee profile</p>
          </div>
        </button>
      ) : (
        <Link
          href="/employees"
          className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all group flex flex-col justify-between"
        >
          <div className="p-2.5 w-fit rounded-xl bg-amber-500 text-white group-hover:scale-110 transition-transform shadow-sm">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="font-bold text-xs text-slate-900">Add New Staff</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Register employee profile</p>
          </div>
        </Link>
      )}
    </div>
  );
};
