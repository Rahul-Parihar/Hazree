'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Building, Users } from 'lucide-react';

export const DepartmentOverview: React.FC = () => {
  const departments = [
    { name: 'Engineering & Tech', present: 48, total: 50, rate: 96 },
    { name: 'Human Resources', present: 12, total: 12, rate: 100 },
    { name: 'Sales & Marketing', present: 32, total: 36, rate: 88.8 },
    { name: 'Design & Product', present: 18, total: 20, rate: 90 },
    { name: 'Finance & Accounts', present: 14, total: 15, rate: 93.3 },
    { name: 'Operations & Logistics', present: 8, total: 15, rate: 53.3 },
  ];

  return (
    <Card title="Department-Wise Attendance" subtitle="Real-time check-in health by organizational unit">
      <div className="space-y-4">
        {departments.map((dept, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 dark:text-slate-200">{dept.name}</span>
              <span className="text-slate-500 font-mono">
                {dept.present}/{dept.total} ({dept.rate}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dept.rate >= 90
                    ? 'bg-emerald-500'
                    : dept.rate >= 80
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${dept.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
