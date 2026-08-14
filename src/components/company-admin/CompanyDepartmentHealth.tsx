'use client';

import React from 'react';
import { useAppSelector } from '../../redux/hooks';

export const CompanyDepartmentHealth: React.FC = () => {
  const employees = useAppSelector((state) => state.employees.employees);
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);
  const companies = useAppSelector((state) => state.companies.companies);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const currentCompany =
    companies.find(
      (c) =>
        c.id === currentUser?.companyId ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 ? companies[0] : null);

  const myCompanyId = currentUser?.companyId ? String(currentUser.companyId).replace('cmp_', '') : (currentCompany?.id ? String(currentCompany.id).replace('cmp_', '') : undefined);
  const myCompanyName = (currentUser?.companyName || currentCompany?.name || '').trim().toLowerCase();

  // Filter employees strictly for this company
  const companyEmployees = employees.filter((e) => {
    const empCompId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
    if (myCompanyId && empCompId && empCompId === myCompanyId) return true;
    if (myCompanyName && e.companyName && e.companyName.trim().toLowerCase() === myCompanyName) return true;
    return false;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);

  // Extract all distinct departments from this company's employees
  const defaultDepts = ['Engineering', 'Human Resources', 'Sales & Marketing', 'Design & UI', 'Operations', 'Finance'];
  const allDepts = Array.from(
    new Set([
      ...defaultDepts,
      ...companyEmployees.map((e) => e.department).filter(Boolean),
    ])
  );

  const deptStats = allDepts
    .map((deptName) => {
      const deptEmployees = companyEmployees.filter((e) => e.department.toLowerCase() === deptName.toLowerCase());
      const total = deptEmployees.length;

      // Find employees present today from this department
      const presentCount = todayRecords.filter(
        (r) => r.department.toLowerCase() === deptName.toLowerCase() && (r.status === 'Present' || r.status === 'Late')
      ).length;

      const rate = total > 0 ? Number(((presentCount / total) * 100).toFixed(1)) : 100;
      const color = rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-rose-500';

      return {
        name: deptName,
        present: presentCount,
        total: total > 0 ? total : 0,
        rate: Math.min(100, rate),
        color,
      };
    })
    .filter((d) => d.total > 0)
    .slice(0, 6);

  const totalEmps = companyEmployees.length || 1;
  const totalPresentToday = todayRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const orgAvg = Math.min(100, Number(((totalPresentToday / totalEmps) * 100).toFixed(1)));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Department Presence Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time check-in rate by team</p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
          Org Avg: {orgAvg}%
        </span>
      </div>

      <div className="space-y-3.5 pt-1">
        {deptStats.length > 0 ? (
          deptStats.map((dept, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate pr-2">{dept.name}</span>
                <span className="font-mono text-slate-600 shrink-0">
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
          ))
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No departments enrolled yet for this organization.
          </div>
        )}
      </div>
    </div>
  );
};
