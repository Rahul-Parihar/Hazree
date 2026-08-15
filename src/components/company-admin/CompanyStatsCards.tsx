'use client';

import React from 'react';
import { Users, UserCheck, Clock, CalendarOff } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

export const CompanyStatsCards: React.FC = () => {
  const employees = useAppSelector((state) => state.employees.employees);
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);
  const leaves = useAppSelector((state) => state.leaves?.leaves || []);
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

  // Filter employees specifically for this company
  const companyEmployees = employees.filter((e) => {
    const empCompId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
    if (myCompanyId && empCompId && empCompId === myCompanyId) return true;
    if (myCompanyName && e.companyName && e.companyName.trim().toLowerCase() === myCompanyName) return true;
    return false;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Total Workforce specifically for this company
  const totalEmployeesCount = companyEmployees.length > 0 ? companyEmployees.length : (currentCompany?.employeeCount || 0);
  const maxQuota = currentCompany?.maxEmployees || 100;
  const planName = currentCompany?.plan || 'Growth';

  // 2. Present Today
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const presentCount = todayRecords.filter((r) => r.status === 'Present').length;
  const attendanceRate = totalEmployeesCount > 0
    ? ((presentCount / totalEmployeesCount) * 100).toFixed(1)
    : '100.0';

  // 3. Late Punch-Ins
  const lateCount = todayRecords.filter((r) => r.status === 'Late').length;

  // 4. On Approved Leave / Inactive for this company
  const approvedLeavesCount = leaves.filter((l) => l.status === 'Approved').length;
  const onLeaveCount = Math.max(companyEmployees.filter((e) => e.status === 'On Leave').length, approvedLeavesCount);

  const stats = [
    {
      title: 'Total Workforce',
      value: totalEmployeesCount.toString(),
      subtext: `${maxQuota} Quota (${planName})`,
      bg: 'bg-blue-600',
      icon: <Users className="w-8 h-8 sm:w-9 sm:h-9 text-white/30" />,
    },
    {
      title: 'Present Today',
      value: presentCount.toString(),
      subtext: `${attendanceRate}% Attendance Rate`,
      bg: 'bg-emerald-600',
      icon: <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 text-white/30" />,
    },
    {
      title: 'Late Punch-Ins',
      value: lateCount.toString(),
      subtext: 'After 09:15 AM Grace',
      bg: 'bg-amber-500',
      icon: <Clock className="w-8 h-8 sm:w-9 sm:h-9 text-white/30" />,
    },
    {
      title: 'On Approved Leave',
      value: onLeaveCount.toString(),
      subtext: `${onLeaveCount} Staff on Leave`,
      bg: 'bg-indigo-600',
      icon: <CalendarOff className="w-8 h-8 sm:w-9 sm:h-9 text-white/30" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`${stat.bg} rounded-2xl p-3.5 sm:p-5 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between`}
        >
          <div className="min-w-0 pr-1.5 sm:pr-2">
            <p className="text-[11px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider truncate">{stat.title}</p>
            <p className="text-2xl sm:text-3xl font-extrabold mt-1 leading-none truncate">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] sm:text-[11px] text-white/90 font-medium bg-black/15 px-1.5 sm:px-2 py-0.5 rounded-md truncate">
                {stat.subtext}
              </span>
            </div>
          </div>
          <div className="hidden xs:block shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
