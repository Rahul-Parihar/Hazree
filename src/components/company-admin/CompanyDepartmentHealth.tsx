'use client';

import React from 'react';

const departments = [
  { name: 'Engineering & Tech', present: 82, total: 85, rate: 96.4, color: 'bg-emerald-500' },
  { name: 'Sales & Marketing', present: 48, total: 55, rate: 87.2, color: 'bg-amber-500' },
  { name: 'Human Resources', present: 16, total: 16, rate: 100, color: 'bg-emerald-500' },
  { name: 'UI/UX & Design', present: 22, total: 24, rate: 91.6, color: 'bg-emerald-500' },
  { name: 'Operations & Logistics', present: 32, total: 40, rate: 80.0, color: 'bg-amber-500' },
  { name: 'Finance & Accounts', present: 18, total: 20, rate: 90.0, color: 'bg-emerald-500' },
];

export const CompanyDepartmentHealth: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Department Presence Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time check-in rate by team</p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Org Avg: 90.8%
        </span>
      </div>

      <div className="space-y-3.5 pt-1">
        {departments.map((dept, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{dept.name}</span>
              <span className="font-mono text-slate-600">
                <strong>{dept.present}</strong>/{dept.total} ({dept.rate}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${dept.color}`}
                style={{ width: `${dept.rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
