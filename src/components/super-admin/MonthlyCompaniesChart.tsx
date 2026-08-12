'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const companyData = [
  { month: 'Jan', companies: 2 },
  { month: 'Feb', companies: 5 },
  { month: 'Mar', companies: 3 },
  { month: 'Apr', companies: 8 },
  { month: 'May', companies: 4 },
  { month: 'Jun', companies: 7 },
  { month: 'Jul', companies: 6 },
  { month: 'Aug', companies: 9 },
  { month: 'Sep', companies: 3 },
  { month: 'Oct', companies: 0 },
  { month: 'Nov', companies: 0 },
  { month: 'Dec', companies: 0 },
];

export const MonthlyCompaniesChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Monthly Companies (Year)</h3>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
          Companies
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={companyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="companies"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Companies Registered"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
