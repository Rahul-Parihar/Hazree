'use client';

import React from 'react';
import { Building2, Users, Fingerprint, Activity, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

interface PlatformStatsProps {
  totalCompanies: number;
}

export const PlatformStats: React.FC<PlatformStatsProps> = ({ totalCompanies }) => {
  const stats = [
    {
      title: 'Total Organizations',
      value: totalCompanies,
      change: '+14% this month',
      isPositive: true,
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/60',
    },
    {
      title: 'Active Platform Users',
      value: '12,450',
      change: '+8.2% growth',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/60',
    },
    {
      title: "Today's Total Punches",
      value: '11,890',
      change: 'Real-time sync',
      isPositive: true,
      icon: <Fingerprint className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200/60',
    },
    {
      title: 'System Uptime & Health',
      value: '99.98%',
      change: 'All Services Operational',
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
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
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
