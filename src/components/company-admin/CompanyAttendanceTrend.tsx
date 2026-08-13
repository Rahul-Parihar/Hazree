'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const weeklyData = [
  { day: 'Mon', present: 226, late: 12, onLeave: 6, absent: 2 },
  { day: 'Tue', present: 230, late: 8, onLeave: 5, absent: 1 },
  { day: 'Wed', present: 222, late: 15, onLeave: 7, absent: 3 },
  { day: 'Thu', present: 228, late: 10, onLeave: 6, absent: 2 },
  { day: 'Fri', present: 218, late: 14, onLeave: 8, absent: 0 },
  { day: 'Sat', present: 195, late: 6, onLeave: 32, absent: 7 },
];

const hourlyPunches = [
  { time: '08:00 AM', punches: 24 },
  { time: '08:30 AM', punches: 58 },
  { time: '09:00 AM', punches: 104 },
  { time: '09:15 AM', punches: 22 },
  { time: '09:30 AM', punches: 14 },
  { time: '10:00 AM', punches: 6 },
];

export const CompanyAttendanceTrend: React.FC = () => {
  const [viewType, setViewType] = useState<'weekly' | 'hourly'>('weekly');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Attendance Analytics & Punch Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewType === 'weekly' ? 'Weekly attendance comparison (Present vs Late vs Leave)' : 'Today check-in traffic velocity'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewType('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewType === 'weekly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Breakdown
          </button>
          <button
            onClick={() => setViewType('hourly')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              viewType === 'hourly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today Hourly Velocity
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="pt-2">
        {viewType === 'weekly' ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#presentGrad)" name="Present" />
              <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#lateGrad)" name="Late Check-in" />
              <Area type="monotone" dataKey="onLeave" stroke="#6366f1" strokeWidth={2} fillOpacity={0} name="On Leave" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hourlyPunches} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="punchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val: any) => [`${val} staff punches`, 'Traffic']}
              />
              <Area type="monotone" dataKey="punches" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#punchGrad)" name="Hourly Punches" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
