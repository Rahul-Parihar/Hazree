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

// Daily revenue data matching the reference pattern — spiky peaks with valleys
const revenueData = [
  { date: '2026-07-14', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-15', totalRevenue: 200, subscriptions: 100, penalties: 0, addons: 0 },
  { date: '2026-07-16', totalRevenue: 1000, subscriptions: 400, penalties: 200, addons: 50 },
  { date: '2026-07-17', totalRevenue: 950, subscriptions: 600, penalties: 150, addons: 0 },
  { date: '2026-07-18', totalRevenue: 300, subscriptions: 100, penalties: 50, addons: 0 },
  { date: '2026-07-19', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-20', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-21', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-22', totalRevenue: 500, subscriptions: 200, penalties: 0, addons: 0 },
  { date: '2026-07-23', totalRevenue: 1800, subscriptions: 800, penalties: 300, addons: 100 },
  { date: '2026-07-24', totalRevenue: 400, subscriptions: 150, penalties: 50, addons: 0 },
  { date: '2026-07-25', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-26', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-07-27', totalRevenue: 100, subscriptions: 50, penalties: 0, addons: 0 },
  { date: '2026-07-28', totalRevenue: 2000, subscriptions: 900, penalties: 400, addons: 200 },
  { date: '2026-07-29', totalRevenue: 3000, subscriptions: 1200, penalties: 1500, addons: 100 },
  { date: '2026-07-30', totalRevenue: 1800, subscriptions: 600, penalties: 1400, addons: 50 },
  { date: '2026-07-31', totalRevenue: 800, subscriptions: 700, penalties: 200, addons: 0 },
  { date: '2026-08-01', totalRevenue: 700, subscriptions: 600, penalties: 100, addons: 0 },
  { date: '2026-08-02', totalRevenue: 750, subscriptions: 400, penalties: 200, addons: 50 },
  { date: '2026-08-03', totalRevenue: 200, subscriptions: 100, penalties: 0, addons: 0 },
  { date: '2026-08-04', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-08-05', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-08-06', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-08-07', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-08-08', totalRevenue: 0, subscriptions: 0, penalties: 0, addons: 0 },
  { date: '2026-08-09', totalRevenue: 100, subscriptions: 50, penalties: 0, addons: 0 },
  { date: '2026-08-10', totalRevenue: 300, subscriptions: 200, penalties: 0, addons: 0 },
  { date: '2026-08-11', totalRevenue: 600, subscriptions: 400, penalties: 0, addons: 100 },
  { date: '2026-08-12', totalRevenue: 500, subscriptions: 300, penalties: 0, addons: 50 },
  { date: '2026-08-13', totalRevenue: 200, subscriptions: 100, penalties: 0, addons: 0 },
];

const formatYAxis = (val: number) => {
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
  return `₹ ${val}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-800 text-white rounded-lg px-4 py-3 shadow-xl border border-slate-700 text-xs">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 py-0.5">
          <span className="w-3 h-[3px] rounded-full" style={{ backgroundColor: entry.stroke }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-bold text-white">₹ {entry.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {/* Header with title and legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-slate-900">Revenue</h3>

        {/* Legend - matching reference style */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-blue-600 rounded-full inline-block" />
            Total Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-teal-500 rounded-full inline-block" />
            Subscriptions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-orange-500 rounded-full inline-block" />
            Penalties
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-pink-500 rounded-full inline-block" />
            Add-ons
          </span>
        </div>
      </div>

      {/* Y-axis label */}
      <div className="relative">
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-medium text-slate-400 tracking-wider">
          Revenue
        </span>

        <div className="pl-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={1}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                name="Total Revenue"
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 2, fill: '#14b8a6', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Subscriptions"
              />
              <Line
                type="monotone"
                dataKey="penalties"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 2, fill: '#f97316', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Penalties"
              />
              <Line
                type="monotone"
                dataKey="addons"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 2, fill: '#ec4899', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Add-ons"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* X-axis label */}
        <p className="text-center text-[10px] font-medium text-slate-400 tracking-wider mt-1">Date</p>
      </div>
    </div>
  );
};
