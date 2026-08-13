'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

const formatValue = (val: number) => {
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return `${val}`;
};

export const MonthlyPunchesChart: React.FC = () => {
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const punchesData = months.map((month, idx) => {
    const count = attendanceRecords.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    }).length;
    return { month, punches: count };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Attendance Punches (Year)</h3>
          <p className="text-xs text-slate-400">Monthly check-in logs</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="w-3 h-3 bg-orange-500 rounded-sm inline-block" />
          Punches
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={punchesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} allowDecimals={false} />
          <Tooltip
            formatter={(value: any) => [formatValue(Number(value)), 'Punches']}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="punches" fill="#f97316" radius={[4, 4, 0, 0]} name="Punches" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

