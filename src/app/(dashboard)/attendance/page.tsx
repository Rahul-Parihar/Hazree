'use client';

import React from 'react';
import { RecentAttendanceTable } from '../../../components/dashboard/RecentAttendanceTable';
import { AttendanceRecord } from '../../../types';
import { CalendarCheck, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { addAttendanceRecord } from '../../../redux/slices/attendanceSlice';

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const records = useAppSelector((state) => state.attendance.records);

  const handleAddRecord = (newRecord: AttendanceRecord) => {
    dispatch(addAttendanceRecord(newRecord));
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
            Complete check-in stream, GPS geofence verifications, and shift hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
            Export Attendance CSV
          </Button>
        </div>
      </div>

      <RecentAttendanceTable records={records} onAddRecord={handleAddRecord} />
    </div>
  );
}

