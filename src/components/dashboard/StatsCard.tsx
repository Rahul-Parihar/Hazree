'use client';

import React from 'react';
import { Users, UserCheck, Clock, UserX, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

export const StatsCard: React.FC = () => {
  const companyStats = [
    {
      title: 'Total Employees',
      value: 148,
      change: '+4 this month',
      isPositive: true,
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/60',
    },
    {
      title: 'Present Today',
      value: 132,
      change: '89.2% Rate',
      isPositive: true,
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/60',
    },
    {
      title: 'Late Arrivals',
      value: 9,
      change: '-2 vs yesterday',
      isPositive: true,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200/60',
    },
    {
      title: 'On Leave / Absent',
      value: 7,
      change: '4 Leaves Approved',
      isPositive: false,
      icon: <UserX className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {companyStats.map((stat, idx) => (
        <Card key={idx} glass className="border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${stat.bg}`}>{stat.icon}</div>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {stat.isPositive ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
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
