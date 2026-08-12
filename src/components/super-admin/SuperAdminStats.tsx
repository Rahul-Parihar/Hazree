'use client';

import React from 'react';
import { Building2, Users, CreditCard, IndianRupee, Fingerprint, ShieldCheck } from 'lucide-react';

interface SuperAdminStatsProps {
  totalCompanies: number;
}

export const SuperAdminStats: React.FC<SuperAdminStatsProps> = ({ totalCompanies }) => {
  const row1 = [
    {
      value: totalCompanies,
      label: 'Total Companies',
      bg: 'bg-blue-600',
      icon: <Building2 className="w-10 h-10 text-white/30" />,
    },
    {
      value: '12,450',
      label: 'Total Employees',
      bg: 'bg-orange-500',
      icon: <Users className="w-10 h-10 text-white/30" />,
    },
    {
      value: 38,
      label: 'Active Subscriptions',
      bg: 'bg-orange-500',
      icon: <CreditCard className="w-10 h-10 text-white/30" />,
    },
    {
      value: 22,
      label: 'Pending Approvals',
      bg: 'bg-slate-800',
      icon: <ShieldCheck className="w-10 h-10 text-white/30" />,
    },
  ];

  const row2 = [
    {
      value: '11,890',
      label: "Today's Total Punches",
      bg: 'bg-emerald-600',
      icon: <Fingerprint className="w-10 h-10 text-white/30" />,
    },
    {
      value: '₹18.4L',
      label: 'Monthly Revenue',
      bg: 'bg-emerald-600',
      icon: <IndianRupee className="w-10 h-10 text-white/30" />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row1.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} rounded-xl p-5 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-shadow`}
          >
            <div>
              <p className="text-3xl font-extrabold leading-none">{stat.value}</p>
              <p className="text-sm font-medium text-white/80 mt-1.5">{stat.label}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Row 2 — 2 cards */}
      <div className="grid grid-cols-2 gap-4">
        {row2.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} rounded-xl p-5 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-shadow`}
          >
            <div>
              <p className="text-3xl font-extrabold leading-none">{stat.value}</p>
              <p className="text-sm font-medium text-white/80 mt-1.5">{stat.label}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>
    </div>
  );
};
