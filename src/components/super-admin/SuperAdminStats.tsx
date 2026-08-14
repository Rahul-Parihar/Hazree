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
      icon: <Building2 className="w-10 h-10 text-white/30" />,
    },
    {
      value: totalStaff.toLocaleString(),
      label: 'Total Staff Enrolled',
      bg: 'bg-orange-500',
      icon: <Users className="w-10 h-10 text-white/30" />,
    },
    {
      value: activeCompanies.toLocaleString(),
      label: 'Active Subscriptions',
      bg: 'bg-emerald-700',
      icon: <CreditCard className="w-10 h-10 text-white/30" />,
    },
    {
      value: pendingCompanies.toLocaleString(),
      label: 'Pending / Suspended',
      bg: 'bg-slate-800',
      icon: <ShieldCheck className="w-10 h-10 text-white/30" />,
    },
  ];

  const row2 = [
    {
      value: todayPunchesCount.toLocaleString(),
      label: "Today's Total Punches",
      bg: 'bg-teal-600',
      icon: <Fingerprint className="w-10 h-10 text-white/30" />,
    },
    {
      value: formattedMrr,
      label: 'Live Monthly Revenue',
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

