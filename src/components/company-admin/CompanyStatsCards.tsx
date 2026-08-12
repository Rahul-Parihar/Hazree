'use client';

import React from 'react';
import { Users, UserCheck, Clock, UserX, CalendarOff, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';

export const CompanyStatsCards: React.FC = () => {
  const stats = [
    {
      title: 'Total Workforce',
      value: '240',
      subtext: '500 Quota (Enterprise)',
      change: '+6 this month',
      isPositive: true,
      bg: 'bg-blue-600',
      icon: <Users className="w-9 h-9 text-white/30" />,
    },
    {
      title: 'Present Today',
      value: '218',
      subtext: '90.8% Attendance Rate',
      change: '+2.4% vs yesterday',
      isPositive: true,
      bg: 'bg-emerald-600',
      icon: <UserCheck className="w-9 h-9 text-white/30" />,
    },
    {
      title: 'Late Punch-Ins',
      value: '14',
      subtext: 'After 09:15 AM Grace',
      change: '-3 vs yesterday',
      isPositive: true,
      bg: 'bg-amber-500',
      icon: <Clock className="w-9 h-9 text-white/30" />,
    },
    {
      title: 'On Approved Leave',
      value: '8',
      subtext: '4 Casual, 3 Sick, 1 Paid',
      change: '2 pending reviews',
      isPositive: false,
      bg: 'bg-indigo-600',
      icon: <CalendarOff className="w-9 h-9 text-white/30" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`${stat.bg} rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between`}
        >
          <div>
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-extrabold mt-1 leading-none">{stat.value}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-white/90 font-medium bg-black/15 px-2 py-0.5 rounded-md">
                {stat.subtext}
              </span>
            </div>
          </div>
          {stat.icon}
        </div>
      ))}
    </div>
  );
};
