'use client';

import React, { useState } from 'react';
import { mockAttendanceRecords } from '../../../lib/mockData';
import { RecentAttendanceTable } from '../../../components/dashboard/RecentAttendanceTable';
import { AttendanceRecord } from '../../../types';
import { CalendarCheck, Download, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  const handleAddRecord = (newRecord: AttendanceRecord) => {
    setRecords([newRecord, ...records]);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Daily Attendance Logs</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
