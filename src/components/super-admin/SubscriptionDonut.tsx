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

export const SubscriptionDonut: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);

  const enterpriseCount = companies.filter((c) => c.plan === 'Enterprise').length;
  const growthCount = companies.filter((c) => c.plan === 'Growth').length;
  const trialCount = companies.filter((c) => c.plan === 'Trial').length;

  const dynamicData = [
    { name: 'Enterprise', value: enterpriseCount, color: '#6366f1' },
    { name: 'Growth', value: growthCount, color: '#10b981' },
    { name: 'Trial', value: trialCount, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const totalCount = enterpriseCount + growthCount + trialCount;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Subscription Plan Distribution</h3>
        <p className="text-xs text-slate-400">Live Breakdown of Registered Tenants</p>
      </div>

      {totalCount === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No registered organizations yet.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 my-2">
            {dynamicData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={dynamicData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {dynamicData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any, name: any) => [`${value} companies`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

