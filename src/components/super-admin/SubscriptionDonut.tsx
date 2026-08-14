'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

const COLOR_PALETTE = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#0ea5e9', // sky
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#64748b', // slate
];

export const SubscriptionDonut: React.FC = () => {
  const companies = useAppSelector((state) => state.companies.companies);
  const backendPlans = useAppSelector((state) => state.subscriptions?.plans || []);

  const dynamicData = useMemo(() => {
    // Collect all plan names
    const planCounts: Record<string, number> = {};

    companies.forEach((c) => {
      const planName = c.plan || 'Free Trial';
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const entries = Object.keys(planCounts).map((pName, idx) => {
      // Find matching theme color from backend plans if available
      const matchedPlan = backendPlans.find(
        (bp) => bp.name.toLowerCase() === pName.toLowerCase() || bp.code.toLowerCase() === pName.toLowerCase()
      );

      let color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      if (matchedPlan?.theme_color === 'emerald') color = '#10b981';
      if (matchedPlan?.theme_color === 'indigo') color = '#6366f1';
      if (matchedPlan?.theme_color === 'purple') color = '#8b5cf6';
      if (matchedPlan?.theme_color === 'amber') color = '#f59e0b';
      if (matchedPlan?.theme_color === 'blue') color = '#0ea5e9';

      return {
        name: pName,
        value: planCounts[pName],
        color,
      };
    });

    return entries.filter((d) => d.value > 0);
  }, [companies, backendPlans]);

  const totalCount = companies.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Subscription Plan Distribution</h3>
        <p className="text-xs text-slate-400">Live Dynamic Breakdown of Registered Tenants</p>
      </div>

      {totalCount === 0 || dynamicData.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No registered organizations yet.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 my-2">
            {dynamicData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
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
