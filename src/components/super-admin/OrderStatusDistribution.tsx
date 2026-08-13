'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

export const OrderStatusDistribution: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);

  const activeCount = companies.filter((c) => c.status === 'Active').length;
  const pendingCount = companies.filter((c) => c.status === 'Pending').length;
  const suspendedCount = companies.filter((c) => c.status === 'Suspended').length;

  const dynamicData = [
    { name: 'Active', value: activeCount, color: '#22c55e' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Suspended', value: suspendedCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const totalCount = activeCount + pendingCount + suspendedCount;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Company Status Distribution</h3>
        <p className="text-xs text-slate-400">Live Breakdown by Account Status</p>
      </div>

      {totalCount === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No registered organizations yet.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 my-2">
            {dynamicData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={dynamicData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {dynamicData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any, name: any) => [`${value} companies`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

