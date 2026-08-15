'use client';

import React, { useEffect, useState } from 'react';
import { RecentAttendanceTable } from '../../../components/dashboard/RecentAttendanceTable';
import { AttendanceRecord } from '../../../types';
import { CalendarCheck, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchAttendanceAsync,
  markAttendanceAsync,
  clearAttendanceError,
  clearAttendanceSuccess,
} from '../../../redux/slices/attendanceSlice';

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const records = useAppSelector((state) => state.attendance.records);
  const isLoading = useAppSelector((state) => state.attendance.isLoading);
  const error = useAppSelector((state) => state.attendance.error);
  const successMessage = useAppSelector((state) => state.attendance.successMessage);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  useEffect(() => {
    dispatch(fetchAttendanceAsync());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAttendanceAsync());
  };

  const handleAddRecord = async (newRecord: AttendanceRecord) => {
    await dispatch(
      markAttendanceAsync({
        employee_name: newRecord.employeeName,
        department: newRecord.department,
        status: newRecord.status,
        check_in_time: newRecord.checkInTime,
        location: newRecord.location,
        device: newRecord.device,
        company_id: currentUser?.companyId ? Number(String(currentUser.companyId).replace('cmp_', '')) : undefined,
      })
    );
  };

  const handleExportCSV = () => {
    if (!records || records.length === 0) return;

    const headers = ['ID', 'Employee Name', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Location', 'Device'];
    const rows = records.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      r.date,
      r.checkInTime,
      r.checkOutTime || '--',
      r.status,
      `"${r.location}"`,
      `"${r.device}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hazree_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Daily Attendance Logs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time check-in stream, biometric verification logs, and shift status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export Attendance CSV
          </Button>
        </div>
      </div>

      {/* Success / Error Toast Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearAttendanceSuccess())}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearAttendanceError())}
            className="text-red-700 hover:text-red-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <RecentAttendanceTable records={records} onAddRecord={handleAddRecord} />
    </div>
  );
}
