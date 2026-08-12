'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  { name: 'Enterprise', value: 18, color: '#ef4444' },
  { name: 'Growth', value: 14, color: '#3b82f6' },
  { name: 'Trial', value: 10, color: '#f59e0b' },
];

export const SubscriptionDonut: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 mb-2">Subscription Plan Distribution</h3>

      <div className="flex items-center justify-center gap-4 mb-2">
        {data.map((entry) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(value: any, name: any) => [`${value} companies`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
