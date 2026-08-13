'use client';

import React, { useState } from 'react';
import { CompanyStatsCards } from './CompanyStatsCards';
import { CompanyAttendanceTrend } from './CompanyAttendanceTrend';
import { CompanyDepartmentHealth } from './CompanyDepartmentHealth';
import { CompanyQuickActions } from './CompanyQuickActions';
import { CompanyKioskGeofenceStatus } from './CompanyKioskGeofenceStatus';
import { RecentAttendanceTable } from '../dashboard/RecentAttendanceTable';
import { AttendanceRecord } from '../../types';
import { Building2, Plus, Calendar, Clock, MapPin, RefreshCw, Shield } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { addAttendanceRecord } from '../../redux/slices/attendanceSlice';

interface CompanyDashboardProps {
  onRoleSwitch?: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const attendanceRecords = useAppSelector((state) => state.attendance.records);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const companyName = currentUser?.companyName || 'Registered Organization';
  const companyInitials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Form states for manual punch
  const [empName, setEmpName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [status, setStatus] = useState<AttendanceRecord['status']>('Present');
  const [checkInTime, setCheckInTime] = useState('09:00 AM');

  const handleAddRecord = (newRecord: AttendanceRecord) => {
    dispatch(addAttendanceRecord(newRecord));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const newRec: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: `emp_${Math.floor(100 + Math.random() * 900)}`,
      employeeName: empName,
      employeeAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      companyId: currentUser?.companyId || 'cmp_101',
      department: department,
      date: new Date().toISOString().split('T')[0],
      checkInTime: checkInTime,
      checkOutTime: '--',
      status: status,
      workHours: 'Active',
      location: 'Official Premises (HR Override)',
      device: 'Company Admin Portal Web',
    };

    dispatch(addAttendanceRecord(newRec));
    setIsManualModalOpen(false);
    setEmpName('');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Company Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white text-emerald-800 font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {companyInitials || 'CO'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">{companyName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Active Organization
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Admin: {currentUser?.name || 'Administrator'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Shift: 09:00 AM - 06:00 PM (15m Grace)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Mark Hazree
          </button>
        </div>
      </div>

      {/* 1. KPI Metric Cards */}
      <CompanyStatsCards />

      {/* 2. Quick Actions */}
      <CompanyQuickActions onOpenManualPunch={() => setIsManualModalOpen(true)} />

      {/* 3. Middle Analytics Grid: Attendance Trend (Left 8) + Department Breakdown (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <CompanyAttendanceTrend />
        </div>
        <div className="lg:col-span-4">
          <CompanyDepartmentHealth />
        </div>
      </div>

      {/* 4. Hardware Kiosk & Geofence Status */}
      <CompanyKioskGeofenceStatus />

      {/* 5. Live Punch Attendance Stream */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today&apos;s Live Employee Attendance Stream</h3>
            <p className="text-xs text-slate-500">
              Real-time check-in punch log verified with facial biometric & GPS geofencing
            </p>
          </div>
        </div>

        <RecentAttendanceTable records={attendanceRecords} onAddRecord={handleAddRecord} />
      </div>

      {/* Manual Punch Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Mark Manual Employee Attendance"
        subtitle="Override attendance log for Tata Tech staff"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input
            label="Employee Full Name"
            placeholder="e.g. Aarav Sharma"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="UI/UX & Design">UI/UX & Design</option>
                <option value="Operations">Operations</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Attendance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceRecord['status'])}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm"
              >
                <option value="Present">Present (On Time)</option>
                <option value="Late">Late Arrival</option>
                <option value="Half Day">Half Day Shift</option>
                <option value="Absent">Unexcused Absent</option>
              </select>
            </div>
          </div>

          <Input
            label="Punch Time"
            placeholder="09:00 AM"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Punch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
