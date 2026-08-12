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

// ---- Top Companies by Revenue ----
const topCompaniesByRevenue = [
  { name: 'Tata Tech Solutions', revenue: 245000 },
  { name: 'NexGen Digital Works', revenue: 128000 },
  { name: 'LogiSpeed Courier Pvt Ltd', revenue: 98000 },
];

// ---- Top Companies by Employees ----
const topCompaniesByEmployees = [
  { name: 'LogiSpeed Courier', employees: 420 },
  { name: 'Tata Tech Solutions', employees: 240 },
  { name: 'ChaiPoint Retail', employees: 110 },
];

// ---- Top Companies by Attendance Rate ----
const topCompaniesByAttendance = [
  { name: 'Tata Tech Solutions', rate: 94.2 },
  { name: 'NexGen Digital Works', rate: 91.5 },
  { name: 'LogiSpeed Courier', rate: 87.3 },
];

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(0)}K`;
  return `₹ ${val}`;
};

interface TopCardProps {
  title: string;
  barColor: string;
  data: { name: string; value: number }[];
  valueLabel: string;
  formatFn?: (v: number) => string;
  tableHeaders: string[];
}

const TopCard: React.FC<TopCardProps> = ({ title, barColor, data, valueLabel, formatFn, tableHeaders }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-3">
        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: barColor }} />
        {valueLabel}
      </div>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            tickFormatter={formatFn || undefined}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 9, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            width={140}
          />
          <Tooltip
            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(v: any) => [formatFn ? formatFn(Number(v)) : v, valueLabel]}
          />
          <Bar dataKey="value" fill={barColor} radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>

      {/* Data Table below chart */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              {tableHeaders.map((h, i) => (
                <th key={i} className="pb-2 pr-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-2 text-slate-500 font-semibold">{idx + 1}</td>
                <td className="py-2 pr-2 text-slate-800 font-semibold">{item.name}</td>
                <td className="py-2 pr-2 text-slate-600 font-mono">
                  {formatFn ? formatFn(item.value) : item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TopCompaniesSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Top Companies by Revenue — Pink/Coral bars */}
      <TopCard
        title="Top Companies (by Revenue)"
        barColor="#fb7185"
        data={topCompaniesByRevenue.map((c) => ({ name: c.name, value: c.revenue }))}
        valueLabel="Revenue"
        formatFn={formatCurrency}
        tableHeaders={['#', 'Company', 'Revenue']}
      />

      {/* Top Companies by Employees — Orange bars */}
      <TopCard
        title="Top Companies (by Employees)"
        barColor="#f97316"
        data={topCompaniesByEmployees.map((c) => ({ name: c.name, value: c.employees }))}
        valueLabel="Employees"
        tableHeaders={['#', 'Company', 'Employees']}
      />

      {/* Top Companies by Attendance — Blue bars */}
      <TopCard
        title="Top Companies (by Attendance %)"
        barColor="#3b82f6"
        data={topCompaniesByAttendance.map((c) => ({ name: c.name, value: c.rate }))}
        valueLabel="Attendance %"
        formatFn={(v) => `${v}%`}
        tableHeaders={['#', 'Company', 'Attendance']}
      />
    </div>
  );
};
