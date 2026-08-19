'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompanyStatsCards } from './CompanyStatsCards';
import { CompanyAttendanceTrend } from './CompanyAttendanceTrend';
import { SubscriptionAlertBanner } from './SubscriptionAlertBanner';
import { CompanyDepartmentHealth } from './CompanyDepartmentHealth';
import { CompanyQuickActions } from './CompanyQuickActions';
import { CompanyKioskGeofenceStatus } from './CompanyKioskGeofenceStatus';
import { CompanyMonthlyShiftAnalytics } from './CompanyMonthlyShiftAnalytics';
import { AddEmployeeModal } from './AddEmployeeModal';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { Building2, Plus, Calendar, Clock, MapPin, RefreshCw, Shield, UserPlus, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchAttendanceAsync } from '../../redux/slices/attendanceSlice';
import { fetchEmployeesAsync } from '../../redux/slices/employeesSlice';
import { fetchLeavesAsync } from '../../redux/slices/leavesSlice';
import { fetchCompaniesAsync } from '../../redux/slices/companiesSlice';
import { fetchDepartmentsAsync } from '../../redux/slices/departmentsSlice';

interface CompanyDashboardProps {
  onRoleSwitch?: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const companies = useAppSelector((state) => state.companies.companies);
  const employees = useAppSelector((state) => state.employees.employees);
  
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    dispatch(fetchEmployeesAsync());
    dispatch(fetchAttendanceAsync());
    dispatch(fetchLeavesAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
  }, [dispatch, currentUser?.companyId]);

  // 15-second polling to keep attendance data synced with backend
  // Customer self clock-ins will reflect here automatically
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(fetchAttendanceAsync());
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [dispatch]);

  const currentCompany =
    companies.find(
      (c) =>
        c.id === currentUser?.companyId ||
        c.id === `cmp_${currentUser?.companyId}` ||
        String(c.id).replace('cmp_', '') === String(currentUser?.companyId || '').replace('cmp_', '') ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 ? companies[0] : null);

  const companyName = currentCompany?.name || currentUser?.companyName || 'Registered Organization';
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const shiftDisplayText = currentCompany?.shiftType || (currentCompany?.shiftCount ? `${currentCompany.shiftCount} Shifts` : '3 Shifts • 8 Hours (24x7 Rotational)');
  const shiftTimingsText = currentCompany?.shiftTimings;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">
      {/* 5-Day Subscription Expiry Warning Banner */}
      <SubscriptionAlertBanner company={currentCompany} />

      {/* Company Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-emerald-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {companyInitials || 'CO'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">{companyName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                Active Organization
              </span>
            </div>
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="flex items-center gap-1 truncate">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Admin: {currentUser?.name || 'Administrator'}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Shift: <strong className="text-white">{shiftDisplayText}</strong></span>
              </div>
            </div>
            {shiftTimingsText && (
              <p className="text-[11px] text-emerald-200/90 font-mono mt-1 truncate max-w-2xl">
                ⏱️ {shiftTimingsText}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/companies/edit"
            className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Info
          </Link>
          <Link
            href="/employees/new"
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Staff
          </Link>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            Clock In
          </button>
        </div>
      </div>

      {/* 1. KPI Metric Cards */}
      <CompanyStatsCards />

      {/* 2. Quick Actions */}
      <CompanyQuickActions
        onOpenManualPunch={() => setIsManualModalOpen(true)}
        onOpenAddEmployee={() => setIsAddEmployeeModalOpen(true)}
      />

      {/* 3. Middle Analytics Grid: Attendance Trend (Left 8) + Department Breakdown (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-8 overflow-hidden">
          <CompanyAttendanceTrend />
        </div>
        <div className="lg:col-span-4 overflow-hidden">
          <CompanyDepartmentHealth />
        </div>
      </div>

      {/* 4. Monthly Attendance, Leaves & Shift Halves Analytics Graph */}
      <CompanyMonthlyShiftAnalytics />

      {/* 5. Hardware Kiosk & Geofence Status */}
      <CompanyKioskGeofenceStatus />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={() => {
          dispatch(fetchEmployeesAsync());
        }}
      />

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          dispatch(fetchAttendanceAsync());
        }}
      />
    </div>
  );
};
