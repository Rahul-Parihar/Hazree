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

export const MonthlyOrdersChart: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const data = months.map((month, idx) => {
    const count = companies.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    }).length;
    return { month, orders: count };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tenant Registrations</h3>
          <p className="text-xs text-slate-400">Monthly breakdown</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="w-3 h-[3px] bg-cyan-500 rounded-full inline-block" />
          Onboarded
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(val: any) => [`${val} Organizations`, 'Registered']}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: '#06b6d4', strokeWidth: 0 }}
            name="Registrations"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-center text-[10px] font-medium text-slate-400 tracking-wider mt-1">Months (Year)</p>
    </div>
  );
};

