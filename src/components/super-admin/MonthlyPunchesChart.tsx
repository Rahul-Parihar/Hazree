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

const punchesData = [
  { month: 'Jan', punches: 8200 },
  { month: 'Feb', punches: 9500 },
  { month: 'Mar', punches: 14000 },
  { month: 'Apr', punches: 11000 },
  { month: 'May', punches: 22000 },
  { month: 'Jun', punches: 18000 },
  { month: 'Jul', punches: 16000 },
  { month: 'Aug', punches: 11890 },
  { month: 'Sep', punches: 0 },
  { month: 'Oct', punches: 0 },
  { month: 'Nov', punches: 0 },
  { month: 'Dec', punches: 0 },
];

const formatValue = (val: number) => {
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return `${val}`;
};

export const MonthlyPunchesChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Monthly Attendance Punches (Year)</h3>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="w-3 h-3 bg-orange-500 rounded-sm inline-block" />
          Punches
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={punchesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
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
