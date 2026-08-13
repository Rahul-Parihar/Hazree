'use client';

import React, { useState, useEffect } from 'react';
import { Company } from '../../types';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { toggleUserRole } from '../../redux/slices/authSlice';
import { addCompany, fetchCompaniesAsync, createCompanyAsync } from '../../redux/slices/companiesSlice';

// Super Admin Components
import { SuperAdminStats } from '../../components/super-admin/SuperAdminStats';
import { RevenueChart } from '../../components/super-admin/RevenueChart';
import { SubscriptionDonut } from '../../components/super-admin/SubscriptionDonut';
import { MonthlyCompaniesChart } from '../../components/super-admin/MonthlyCompaniesChart';
import { MonthlyPunchesChart } from '../../components/super-admin/MonthlyPunchesChart';
import { MonthlyOrdersChart } from '../../components/super-admin/MonthlyOrdersChart';
import { OrderStatusDistribution } from '../../components/super-admin/OrderStatusDistribution';
import { TopCompaniesSection } from '../../components/super-admin/TopCompaniesSection';

import { RegisterCompanyModal } from '../../components/super-admin/RegisterCompanyModal';

// Company Admin Dedicated Dashboard
import { CompanyDashboard } from '../../components/company-admin/CompanyDashboard';

import { Building2, Plus, ShieldCheck, RefreshCw, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const companies = useAppSelector((state) => state.companies.companies);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Dynamic Date calculation helpers
  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'last7' | 'last30' | 'thisMonth' | 'ytd' | 'custom'>('last30');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const handlePresetSelect = (preset: 'today' | 'last7' | 'last30' | 'thisMonth' | 'ytd') => {
    setDateRangePreset(preset);
    const today = new Date();
    let start = new Date();

    if (preset === 'today') {
      start = today;
    } else if (preset === 'last7') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'last30') {
      start.setDate(today.getDate() - 30);
    } else if (preset === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === 'ytd') {
      start = new Date(today.getFullYear(), 0, 1);
    }

    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(today));
  };

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
  }, [dispatch]);

  const handleRegisterCompanySuccess = (newCompany: Company) => {
    dispatch(createCompanyAsync(newCompany));
  };

  const handleToggleRole = () => {
    dispatch(toggleUserRole());
  };



  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* SUPER ADMIN VIEW */}
      {userRole === 'SUPER_ADMIN' ? (
        <div className="space-y-5">
          {/* Dashboard Title Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Super Admin Dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Company
              </button>
            </div>
          </div>

          {/* Colorful Stat Cards */}
          <SuperAdminStats totalCompanies={companies.length} />

          {/* Dynamic Date Range & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="font-semibold text-slate-700">Date Range:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateRangePreset('custom');
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <span className="text-slate-400">➔</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateRangePreset('custom');
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Today', val: 'today' },
                  { label: 'Last 7d', val: 'last7' },
                  { label: 'Last 30d', val: 'last30' },
                  { label: 'This Month', val: 'thisMonth' },
                  { label: 'YTD', val: 'ytd' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    onClick={() => handlePresetSelect(btn.val as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dateRangePreset === btn.val
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Filter: <span className="font-bold text-slate-800">{startDate}</span> to <span className="font-bold text-slate-800">{endDate}</span>
            </div>
          </div>

          {/* Charts Row 1: Revenue (large) + Donut (small) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <RevenueChart startDate={startDate} endDate={endDate} />
            </div>
            <div className="lg:col-span-4">
              <SubscriptionDonut />
            </div>
          </div>

          {/* Charts Row 2: Monthly Companies (line) + Monthly Punches (bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MonthlyCompaniesChart />
            <MonthlyPunchesChart />
          </div>

          {/* Charts Row 3: Monthly Orders (line) + Status Distribution (donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MonthlyOrdersChart />
            <OrderStatusDistribution />
          </div>

          {/* Row 4: Top Companies — 3 horizontal bar charts + tables */}
          <TopCompaniesSection />
        </div>
      ) : (
        /* COMPANY ADMIN DEDICATED VIEW */
        <CompanyDashboard onRoleSwitch={handleToggleRole} />
      )}

      {/* Super Admin Company Registration Modal */}
      <RegisterCompanyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterCompanySuccess}
      />
    </div>
  );
}
