'use client';

import React, { useState } from 'react';
import { Company, AttendanceRecord } from '../../types';
import { initialCompanies, mockAttendanceRecords } from '../../lib/mockData';
import { useUserRole } from '../../context/UserRoleContext';

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

// Company Admin Components
import { StatsCard } from '../../components/dashboard/StatsCard';
import { AttendanceChart } from '../../components/dashboard/AttendanceChart';
import { RecentAttendanceTable } from '../../components/dashboard/RecentAttendanceTable';
import { DepartmentOverview } from '../../components/dashboard/DepartmentOverview';
import { QuickActions } from '../../components/dashboard/QuickActions';

import { Building2, Plus, ShieldCheck, RefreshCw, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const { userRole, toggleUserRole } = useUserRole();
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Date range filter state
  const [dateRange, setDateRange] = useState('last30');

  const handleRegisterCompanySuccess = (newCompany: Company) => {
    setCompanies([newCompany, ...companies]);
  };

  const handleCompanyStatusChange = (id: string, newStatus: Company['status']) => {
    setCompanies(
      companies.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleAddAttendanceRecord = (newRecord: AttendanceRecord) => {
    setAttendanceRecords([newRecord, ...attendanceRecords]);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* SUPER ADMIN VIEW */}
      {userRole === 'SUPER_ADMIN' ? (
        <div className="space-y-5">
          {/* Dashboard Title Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Company
              </button>
              <button
                onClick={toggleUserRole}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                Switch to Company Admin
              </button>
              <a
                href="#"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </a>
            </div>
          </div>

          {/* Colorful Stat Cards */}
          <SuperAdminStats totalCompanies={companies.length} />

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-3 py-1">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Date Range:</span>
              <input
                type="date"
                defaultValue="2026-01-01"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span>-</span>
              <input
                type="date"
                defaultValue="2026-08-12"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Numbers:</span>
              <select className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Show (1-30)</option>
                <option>Show (1-60)</option>
                <option>Show (1-90)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: 'Last 7d', val: 'last7' },
                { label: 'Last 30d', val: 'last30' },
                { label: 'YTD', val: 'ytd' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setDateRange(btn.val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    dateRange === btn.val
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charts Row 1: Revenue (large) + Donut (small) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <RevenueChart />
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
        /* COMPANY ADMIN VIEW */
        <div className="space-y-6">
          {/* Dashboard Title Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Company Attendance Dashboard</h2>
            <button
              onClick={toggleUserRole}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Switch to Super Admin
            </button>
          </div>

          {/* KPI Stat Cards */}
          <StatsCard />

          {/* Attendance Chart & Department Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceChart />
            </div>
            <div className="lg:col-span-1">
              <DepartmentOverview />
            </div>
          </div>

          {/* Quick Actions Bar */}
          <QuickActions userRole={userRole} />

          {/* Live Attendance Table */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today&apos;s Live Attendance Logs</h3>
              <p className="text-xs text-slate-500">
                Real-time facial & GPS geofenced check-in stream
              </p>
            </div>

            <RecentAttendanceTable records={attendanceRecords} onAddRecord={handleAddAttendanceRecord} />
          </div>
        </div>
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
