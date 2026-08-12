'use client';

import React, { useState } from 'react';
import { Company, AttendanceRecord } from '../../types';
import { initialCompanies, mockAttendanceRecords } from '../../lib/mockData';
import { useUserRole } from '../../context/UserRoleContext';
import { PlatformStats } from '../../components/super-admin/PlatformStats';
import { CompanyTable } from '../../components/super-admin/CompanyTable';
import { RegisterCompanyModal } from '../../components/super-admin/RegisterCompanyModal';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { AttendanceChart } from '../../components/dashboard/AttendanceChart';
import { RecentAttendanceTable } from '../../components/dashboard/RecentAttendanceTable';
import { DepartmentOverview } from '../../components/dashboard/DepartmentOverview';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Building2, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const { userRole, toggleUserRole } = useUserRole();
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Perspective Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
            {userRole === 'SUPER_ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">
                {userRole === 'SUPER_ADMIN' ? 'Hazree Platform Super Admin' : 'Tata Tech Solutions HR Admin'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {userRole === 'SUPER_ADMIN'
                ? 'Registering and managing active companies across India'
                : 'Managing 148 active staff attendance logs & geofence punch logs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'SUPER_ADMIN' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              Register Company
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-white border-slate-700 hover:bg-slate-800"
            icon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
            onClick={toggleUserRole}
          >
            Switch Role View
          </Button>
        </div>
      </div>

      {/* SUPER ADMIN VIEW */}
      {userRole === 'SUPER_ADMIN' ? (
        <div className="space-y-6">
          {/* Platform KPIs */}
          <PlatformStats totalCompanies={companies.length} />

          {/* Quick Shortcuts */}
          <QuickActions
            onRegisterCompanyModal={() => setIsRegisterModalOpen(true)}
            userRole={userRole}
          />

          {/* Registered Companies Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Companies Directory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Onboarded organizations, subscription plans, and employee limits
                </p>
              </div>
            </div>

            <CompanyTable
              companies={companies}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onStatusChange={handleCompanyStatusChange}
            />
          </div>
        </div>
      ) : (
        /* COMPANY ADMIN VIEW */
        <div className="space-y-6">
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Live Attendance Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time facial & GPS geofenced check-in stream
                </p>
              </div>
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
