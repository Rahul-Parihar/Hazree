'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../redux/hooks';

interface RevenueChartProps {
  startDate?: string;
  endDate?: string;
}

const formatYAxis = (val: number) => {
  if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹ ${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
  return `₹ ${val}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl border border-slate-800 text-xs">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
            <span className="text-slate-300">{entry.name}:</span>
          </div>
          <span className="font-bold text-white font-mono">₹ {Number(entry.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ startDate, endDate }) => {
  const companies = useAppSelector((state) => state.companies.companies);
  const attendanceRecords = useAppSelector((state) => state.attendance?.records || []);

  // Compute 100% dynamic daily revenue metrics based on date range, companies and attendance records
  const revenueData = useMemo(() => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);

    const dateList: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      dateList.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    if (dateList.length === 0) {
      dateList.push(new Date().toISOString().split('T')[0]);
    }

    const activeCompanies = companies.filter((c) => c.status === 'Active');

    return dateList.map((dStr) => {
      // 1. Companies registered ON this exact date:
      const newRegistrationsOnDate = activeCompanies.filter((c) => {
        const cDate = c.createdAt ? c.createdAt.split('T')[0] : '';
        return cDate === dStr;
      });

      const newPlanRevenue = newRegistrationsOnDate.reduce((sum, c) => {
        if (c.plan === 'Enterprise') return sum + 14999;
        if (c.plan === 'Growth') return sum + 4999;
        return sum;
      }, 0);

      // 2. Companies active on or prior to this date:
      const activePriorToOrOnDate = activeCompanies.filter((c) => {
        const cDate = c.createdAt ? c.createdAt.split('T')[0] : '';
        return !cDate || cDate <= dStr;
      });

      // Daily recurring subscription fee:
      const dailyRecurring = activePriorToOrOnDate.reduce((sum, c) => {
        if (c.plan === 'Enterprise') return sum + Math.round(14999 / 30);
        if (c.plan === 'Growth') return sum + Math.round(4999 / 30);
        return sum;
      }, 0);

      const subscriptions = newPlanRevenue + (newRegistrationsOnDate.length === 0 ? dailyRecurring : 0);

      // 3. Penalties from attendance records & compliance on that date:
      const dayPunchFines = attendanceRecords
        .filter((r) => r.date === dStr && (r.status === 'Late' || r.status === 'Half Day'))
        .length * 150;

      const totalStaff = activePriorToOrOnDate.reduce((sum, c) => sum + (c.employeeCount || 0), 0);
      const staffComplianceFine = activePriorToOrOnDate.length > 0 ? Math.round(totalStaff * 2) : 0;
      const penalties = dayPunchFines + staffComplianceFine;

      // 4. Add-ons (extra staff capacity above base limit & kiosk licenses):
      const capacityAddons = activePriorToOrOnDate.reduce((sum, c) => {
        const quota = c.maxEmployees || 100;
        if (quota > 100) return sum + Math.round((quota - 100) * 5 / 30);
        return sum;
      }, 0);

      const newAddonBundle = newRegistrationsOnDate.length > 0 ? Math.round(newPlanRevenue * 0.08) : 0;
      const addons = capacityAddons + newAddonBundle;

      // 5. Total Aggregate Revenue:
      const totalRevenue = subscriptions + penalties + addons;

      return {
        date: dStr,
        totalRevenue,
        subscriptions,
        penalties,
        addons,
      };
    });
  }, [companies, attendanceRecords, startDate, endDate]);

  const totalCalculatedRevenue = useMemo(() => {
    return revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  }, [revenueData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {/* Header with title and legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-slate-900">Revenue</h3>

        {/* Legend - matching original style */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-blue-600 rounded-full inline-block" />
            Total Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-teal-500 rounded-full inline-block" />
            Subscriptions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-orange-500 rounded-full inline-block" />
            Penalties
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-[3px] bg-pink-500 rounded-full inline-block" />
            Add-ons
          </span>
        </div>
      </div>

      {/* Y-axis label */}
      <div className="relative">
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-medium text-slate-400 tracking-wider">
          Revenue
        </span>

        <div className="pl-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={1}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                name="Total Revenue"
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 2, fill: '#14b8a6', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Subscriptions"
              />
              <Line
                type="monotone"
                dataKey="penalties"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 2, fill: '#f97316', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Penalties"
              />
              <Line
                type="monotone"
                dataKey="addons"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ r: 2, fill: '#ec4899', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                name="Add-ons"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* X-axis label */}
        <p className="text-center text-[10px] font-medium text-slate-400 tracking-wider mt-1">Date</p>
      </div>
    </div>
  );
};

