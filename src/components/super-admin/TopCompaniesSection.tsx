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

import { useAppSelector } from '../../redux/hooks';
import { Building2 } from 'lucide-react';

export const TopCompaniesSection: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No Organization Statistics Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Once you register organizations on the platform, live revenue breakdown, employee counts, and attendance metrics will appear here.
        </p>
      </div>
    );
  }

  // Dynamic ranking from live companies
  const revenueRanking = companies.slice(0, 5).map((c) => ({
    name: c.name,
    value: c.plan === 'Enterprise' ? 14999 : c.plan === 'Growth' ? 4999 : 0,
  }));

  const employeeRanking = companies.slice(0, 5).map((c) => ({
    name: c.name,
    value: c.maxEmployees || c.employeeCount || 100,
  }));

  const activeRanking = companies.slice(0, 5).map((c) => ({
    name: c.name,
    value: c.status === 'Active' ? 100 : 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Top Companies by Plan Value */}
      <TopCard
        title="Top Organizations (by Subscription)"
        barColor="#fb7185"
        data={revenueRanking}
        valueLabel="Monthly Plan"
        formatFn={formatCurrency}
        tableHeaders={['#', 'Company', 'Plan Value']}
      />

      {/* Top Companies by Employee Limit */}
      <TopCard
        title="Top Organizations (by Capacity)"
        barColor="#f97316"
        data={employeeRanking}
        valueLabel="Max Staff"
        tableHeaders={['#', 'Company', 'Capacity']}
      />

      {/* Top Companies by Status */}
      <TopCard
        title="Organization Status Health"
        barColor="#3b82f6"
        data={activeRanking}
        valueLabel="Health %"
        formatFn={(v) => `${v}%`}
        tableHeaders={['#', 'Company', 'Operational']}
      />
    </div>
  );
};

