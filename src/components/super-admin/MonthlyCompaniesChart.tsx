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
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

export const MonthlyCompaniesChart: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();

  const companyData = months.map((month, idx) => {
    const count = companies.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    }).length;
    return { month, companies: count };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Monthly Organization Onboarding</h3>
          <p className="text-xs text-slate-400">Live Registrations per Month</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
          Registered
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={companyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(value: any) => [`${value} Organizations`, 'Registered']}
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

