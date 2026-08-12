'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const data = [
  { name: 'Active', value: 38, color: '#22c55e' },
  { name: 'Pending', value: 4, color: '#f59e0b' },
  { name: 'Suspended', value: 2, color: '#ef4444' },
  { name: 'Expired', value: 3, color: '#94a3b8' },
];

export const OrderStatusDistribution: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Company Status Distribution</h3>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
        {data.map((entry) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            formatter={(value: any, name: any) => [`${value} companies`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
