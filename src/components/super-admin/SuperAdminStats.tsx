'use client';

import React from 'react';
import { Building2, Users, CreditCard, IndianRupee, Fingerprint, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

interface SuperAdminStatsProps {
  totalCompanies?: number;
}

export const SuperAdminStats: React.FC<SuperAdminStatsProps> = ({ totalCompanies: propTotalCompanies }) => {
  const companies = useAppSelector((state) => state.companies.companies);
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);

  const totalCompanies = propTotalCompanies !== undefined ? propTotalCompanies : companies.length;
  const activeCompanies = companies.filter((c) => c.status === 'Active').length;
  const pendingCompanies = companies.filter((c) => c.status === 'Pending' || c.status === 'Suspended').length;
  const totalStaff = companies.reduce((acc, c) => acc + (c.employeeCount || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPunchesCount = attendanceRecords.filter((r) => r.date === todayStr).length;

  const backendPlans = useAppSelector((state) => state.subscriptions?.plans || []);

  // Monthly Recurring Revenue (MRR) dynamically computed from active plans
  const totalMrr = companies.reduce((acc, c) => {
    if (c.status === 'Active') {
      const planName = (c.plan || '').toLowerCase();
      const matched = backendPlans.find(
        (p) => p.name.toLowerCase() === planName || p.code.toLowerCase() === planName
      );
      if (matched) {
        return acc + (Number(matched.price_amount) || 0);
      }
      if (planName === 'enterprise') return acc + 14999;
      if (planName === 'growth') return acc + 4999;
    }
    return acc;
  }, 0);

  const formattedMrr =
    totalMrr === 0
      ? '₹0'
      : totalMrr >= 100000
      ? `₹${(totalMrr / 100000).toFixed(1)}L`
      : `₹${totalMrr.toLocaleString()}`;

  const row1 = [
    {
      value: totalCompanies.toLocaleString(),
      label: 'Total Organizations',
      bg: 'bg-blue-600',
      icon: <Building2 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
    {
      value: totalStaff.toLocaleString(),
      label: 'Total Staff Enrolled',
      bg: 'bg-orange-500',
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
    {
      value: activeCompanies.toLocaleString(),
      label: 'Active Subscriptions',
      bg: 'bg-emerald-700',
      icon: <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
    {
      value: pendingCompanies.toLocaleString(),
      label: 'Pending / Suspended',
      bg: 'bg-slate-800',
      icon: <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
  ];

  const row2 = [
    {
      value: todayPunchesCount.toLocaleString(),
      label: "Today's Total Punches",
      bg: 'bg-teal-600',
      icon: <Fingerprint className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
    {
      value: formattedMrr,
      label: 'Live Monthly Revenue',
      bg: 'bg-emerald-600',
      icon: <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white/30 shrink-0" />,
    },
  ];

  return (
    <div className="space-y-2.5 sm:space-y-4">
      {/* Row 1 — 4 cards in 2-column grid on mobile, 4-column on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {row1.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} rounded-2xl p-3.5 sm:p-4 lg:p-5 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-all`}
          >
            <div className="min-w-0 pr-1.5 sm:pr-2">
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none truncate">{stat.value}</p>
              <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-white/90 mt-1 sm:mt-1.5 line-clamp-2 sm:truncate">{stat.label}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Row 2 — 2 cards in 2-column grid on mobile and desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {row2.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} rounded-2xl p-3.5 sm:p-4 lg:p-5 flex items-center justify-between text-white shadow-md hover:shadow-lg transition-all`}
          >
            <div className="min-w-0 pr-1.5 sm:pr-2">
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none truncate">{stat.value}</p>
              <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-white/90 mt-1 sm:mt-1.5 line-clamp-2 sm:truncate">{stat.label}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>
    </div>
  );
};
