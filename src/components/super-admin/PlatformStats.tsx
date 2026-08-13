'use client';

import React from 'react';
import { Building2, Users, Fingerprint, Activity, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { useAppSelector } from '../../redux/hooks';

interface PlatformStatsProps {
  totalCompanies?: number;
}

export const PlatformStats: React.FC<PlatformStatsProps> = ({ totalCompanies: propTotalCompanies }) => {
  const companies = useAppSelector((state) => state.companies.companies);
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);

  const totalCompanies = propTotalCompanies !== undefined ? propTotalCompanies : companies.length;
  const activeCompanies = companies.filter((c) => c.status === 'Active').length;
  const totalStaff = companies.reduce((acc, c) => acc + (c.employeeCount || 0), 0);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPunchesCount = attendanceRecords.filter((r) => r.date === todayStr).length;

  const stats = [
    {
      title: 'Total Organizations',
      value: totalCompanies.toLocaleString(),
      change: totalCompanies > 0 ? `${activeCompanies} Active` : '0 Registered',
      isPositive: totalCompanies > 0,
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/60',
    },
    {
      title: 'Active Platform Users',
      value: totalStaff.toLocaleString(),
      change: totalStaff > 0 ? `+${totalStaff} Staff Enrolled` : '0 Staff Enrolled',
      isPositive: totalStaff > 0,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/60',
    },
    {
      title: "Today's Total Punches",
      value: todayPunchesCount.toLocaleString(),
      change: todayPunchesCount > 0 ? `${todayPunchesCount} Synced Today` : 'Live DB Sync',
      isPositive: todayPunchesCount > 0,
      icon: <Fingerprint className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200/60',
    },
    {
      title: 'Database & System Health',
      value: '100%',
      change: 'PostgreSQL Online',
      isPositive: true,
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} glass className="relative overflow-hidden border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${stat.bg}`}>{stat.icon}</div>
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                stat.isPositive
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200/50'
                  : 'text-slate-600 bg-slate-50 border-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {stat.title}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
};

