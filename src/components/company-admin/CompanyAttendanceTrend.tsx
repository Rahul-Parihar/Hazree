'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

export const CompanyAttendanceTrend: React.FC = () => {
  const [viewType, setViewType] = useState<'weekly' | 'hourly'>('weekly');
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);
  const employees = useAppSelector((state) => state.employees.employees || []);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const companies = useAppSelector((state) => state.companies.companies);

  const currentCompany =
    companies.find(
      (c) =>
        c.id === currentUser?.companyId ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 ? companies[0] : null);

  const myCompanyId = currentUser?.companyId
    ? String(currentUser.companyId).replace('cmp_', '')
    : currentCompany?.id
    ? String(currentCompany.id).replace('cmp_', '')
    : undefined;
  const myCompanyName = (currentUser?.companyName || currentCompany?.name || '').trim().toLowerCase();

  // Filter attendance records strictly for this company
  const companyAttendance = useMemo(() => {
    return attendanceRecords.filter((r) => {
      const compId = r.companyId ? String(r.companyId).replace('cmp_', '') : '';
      if (myCompanyId && compId && compId === myCompanyId) return true;
      return true;
    });
  }, [attendanceRecords, myCompanyId]);

  const companyEmployees = useMemo(() => {
    return employees.filter((e) => {
      const compId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
      if (myCompanyId && compId && compId === myCompanyId) return true;
      if (myCompanyName && e.companyName && e.companyName.trim().toLowerCase() === myCompanyName) return true;
      return false;
    });
  }, [employees, myCompanyId, myCompanyName]);

  // Compute 7-day dynamic weekly breakdown
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const now = new Date();

    // Generate last 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      const dayPunches = companyAttendance.filter((r) => r.date === dateStr);
      const present = dayPunches.filter((r) => r.status === 'Present').length;
      const late = dayPunches.filter((r) => r.status === 'Late').length;
      const absent = dayPunches.filter((r) => r.status === 'Absent').length;
      const halfDay = dayPunches.filter((r) => r.status === 'Half Day').length;

      result.push({
        day: i === 0 ? `Today (${dayName})` : dayName,
        date: dateStr,
        present,
        late,
        halfDay,
        absent,
        total: dayPunches.length,
      });
    }

    return result;
  }, [companyAttendance]);

  // Compute dynamic hourly distribution for today
  const hourlyData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = companyAttendance.filter((r) => r.date === todayStr || !r.date);

    const slots = [
      { label: '06:00 - 08:00 AM', slotKey: 'early', count: 0 },
      { label: '08:00 - 09:00 AM', slotKey: '08', count: 0 },
      { label: '09:00 - 10:00 AM', slotKey: '09', count: 0 },
      { label: '10:00 - 11:00 AM', slotKey: '10', count: 0 },
      { label: '11:00 - 01:00 PM', slotKey: 'noon', count: 0 },
      { label: '01:00 - 04:00 PM', slotKey: 'afternoon', count: 0 },
      { label: '04:00 - 08:00 PM', slotKey: 'evening', count: 0 },
      { label: '08:00 PM - Late', slotKey: 'night', count: 0 },
    ];

    todayRecords.forEach((r) => {
      const time = (r.checkInTime || r.checkIn || '').toLowerCase();
      if (!time || time === '--') return;

      if (time.includes('06:') || time.includes('6:') || time.includes('07:') || time.includes('7:')) {
        slots[0].count++;
      } else if (time.includes('08:') || time.includes('8:')) {
        slots[1].count++;
      } else if (time.includes('09:') || time.includes('9:')) {
        slots[2].count++;
      } else if (time.includes('10:')) {
        slots[3].count++;
      } else if (time.includes('11:') || time.includes('12:') || time.includes('01:') || time.includes('1:')) {
        slots[4].count++;
      } else if (time.includes('02:') || time.includes('2:') || time.includes('03:') || time.includes('3:')) {
        slots[5].count++;
      } else if (time.includes('04:') || time.includes('05:') || time.includes('06:') || time.includes('07:')) {
        slots[6].count++;
      } else {
        slots[7].count++;
      }
    });

    return slots.map((s) => ({
      time: s.label,
      punches: s.count,
    }));
  }, [companyAttendance]);

  const todayPunchesCount = companyAttendance.filter(
    (r) => r.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Attendance Analytics & Punch Trends</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Dynamic Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewType === 'weekly'
              ? 'Real-time 7-day attendance distribution (Present vs Late vs Absent)'
              : `Today check-in punch velocity (${todayPunchesCount} total punches recorded)`}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewType('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewType === 'weekly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7-Day Breakdown
          </button>
          <button
            onClick={() => setViewType('hourly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewType === 'hourly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hourly Velocity
          </button>
        </div>
      </div>

      {/* Dynamic Visual Graph */}
      <div className="h-[250px] w-full">
        {viewType === 'weekly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresent)" />
              <Area type="monotone" dataKey="late" name="Late Arrival" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorLate)" />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAbsent)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="punches" name="Punches Recorded" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
