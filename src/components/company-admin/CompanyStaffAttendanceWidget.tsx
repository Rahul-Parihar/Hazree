'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  UserCheck,
  Building2,
  Briefcase,
  Sparkles,
  Phone,
  Mail,
  User,
  Activity,
  Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAttendanceAsync } from '../../redux/slices/attendanceSlice';
import { Employee, AttendanceRecord } from '../../types';
import { Badge } from '../ui/Badge';
import { MarkAttendanceModal } from './MarkAttendanceModal';

export const CompanyStaffAttendanceWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userRole = useAppSelector((state) => state.auth.userRole);
  const allEmployees = useAppSelector((state) => state.employees.employees);
  const attendanceRecords = useAppSelector((state) => state.attendance.records);
  const companies = useAppSelector((state) => state.companies.companies);

  const currentCompany =
    companies.find(
      (c) =>
        c.id === currentUser?.companyId ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 ? companies[0] : null);

  const myCompanyId = currentUser?.companyId
    ? String(currentUser.companyId).replace('cmp_', '')
    : currentCompany?.id
    ? String(currentCompany.id).replace('cmp_', '')
    : undefined;
  const myCompanyName = (currentUser?.companyName || currentCompany?.name || '').trim().toLowerCase();

  // Filter employees strictly for this company
  const companyEmployees = useMemo(() => {
    return allEmployees.filter((e) => {
      const empCompId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
      if (myCompanyId && empCompId && empCompId === myCompanyId) return true;
      if (myCompanyName && e.companyName && e.companyName.trim().toLowerCase() === myCompanyName) return true;
      return false;
    });
  }, [allEmployees, myCompanyId, myCompanyName]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'NOT_PUNCHED'>('ALL');
  const [selectedEmpForPunch, setSelectedEmpForPunch] = useState<Employee | null>(null);
  const [punchType, setPunchType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 15-second polling to auto-refresh attendance from backend
  // This enables customer self clock-ins to appear here automatically
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(fetchAttendanceAsync());
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [dispatch]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Distinct roles for filter
  const distinctRoles = useMemo(() => {
    return Array.from(new Set(companyEmployees.map((e) => e.role).filter(Boolean)));
  }, [companyEmployees]);

  // Compute live presence stats
  const staffPunchStats = useMemo(() => {
    let activeSessions = 0;
    let completedSessions = 0;
    let notPunched = 0;

    companyEmployees.forEach((emp) => {
      const punch = attendanceRecords.find(
        (r) =>
          (r.employeeId === emp.id || r.employeeId === String(emp.id).replace('emp_', '')) &&
          (r.date === todayStr || !r.date)
      );

      const isClockedIn = punch && punch.checkIn && punch.checkIn !== '--';
      const isClockedOut = isClockedIn && punch.checkOut && punch.checkOut !== '--';

      if (isClockedOut) {
        completedSessions++;
      } else if (isClockedIn) {
        activeSessions++;
      } else {
        notPunched++;
      }
    });

    const clockedInTotal = activeSessions + completedSessions;
    const totalStaff = companyEmployees.length || 1;
    const percentage = Math.round((clockedInTotal / totalStaff) * 100);

    return {
      clockedInTotal,
      activeSessions,
      completedSessions,
      notPunched,
      totalStaff: companyEmployees.length,
      percentage,
    };
  }, [companyEmployees, attendanceRecords, todayStr]);

  const filteredEmployees = useMemo(() => {
    return companyEmployees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' || emp.role.toLowerCase() === roleFilter.toLowerCase();

      const todayPunch = attendanceRecords.find(
        (r) =>
          (r.employeeId === emp.id || r.employeeId === String(emp.id).replace('emp_', '')) &&
          (r.date === todayStr || !r.date)
      );

      const isClockedIn = todayPunch && todayPunch.checkIn && todayPunch.checkIn !== '--';
      const isClockedOut = isClockedIn && todayPunch.checkOut && todayPunch.checkOut !== '--';

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus = Boolean(isClockedIn && !isClockedOut);
      } else if (statusFilter === 'COMPLETED') {
        matchesStatus = Boolean(isClockedOut);
      } else if (statusFilter === 'NOT_PUNCHED') {
        matchesStatus = !isClockedIn;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [companyEmployees, searchQuery, roleFilter, statusFilter, attendanceRecords, todayStr]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
      {/* 1. Header with Title & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Staff Quick Punch Console
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {staffPunchStats.clockedInTotal} / {staffPunchStats.totalStaff} Clocked In Today
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant attendance punch for HR, Managers, Leads and Team Staff
            </p>
          </div>
        </div>

        {/* Search & Role Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, HR, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {distinctRoles.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {distinctRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 2. Visual Punch Status Summary Bar & Interactive Status Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
        {/* Total Roster Card */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
            statusFilter === 'ALL'
              ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white/60 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">All Staff</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{staffPunchStats.totalStaff}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-slate-700 h-full rounded-full w-full" />
          </div>
        </button>

        {/* Active Sessions Card */}
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
            statusFilter === 'ACTIVE'
              ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white/60 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active Sessions
            </span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-extrabold text-amber-900 mt-1 font-mono">{staffPunchStats.activeSessions}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${staffPunchStats.totalStaff ? (staffPunchStats.activeSessions / staffPunchStats.totalStaff) * 100 : 0}%`,
              }}
            />
          </div>
        </button>

        {/* Completed Shifts Card */}
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
            statusFilter === 'COMPLETED'
              ? 'bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white/60 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Completed Shift</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-emerald-900 mt-1 font-mono">{staffPunchStats.completedSessions}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${staffPunchStats.totalStaff ? (staffPunchStats.completedSessions / staffPunchStats.totalStaff) * 100 : 0}%`,
              }}
            />
          </div>
        </button>

        {/* Pending Punch Card */}
        <button
          onClick={() => setStatusFilter('NOT_PUNCHED')}
          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
            statusFilter === 'NOT_PUNCHED'
              ? 'bg-white border-rose-500 shadow-sm ring-2 ring-rose-500/20'
              : 'bg-white/60 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">Pending Punch</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{staffPunchStats.notPunched}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-rose-400 h-full rounded-full transition-all"
              style={{
                width: `${staffPunchStats.totalStaff ? (staffPunchStats.notPunched / staffPunchStats.totalStaff) * 100 : 0}%`,
              }}
            />
          </div>
        </button>
      </div>

      {/* 3. Staff Roster Grid / Table */}
      {filteredEmployees.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-2">
          <p className="text-sm font-bold text-slate-700">No Staff Members Found</p>
          <p className="text-xs text-slate-400">
            {companyEmployees.length === 0
              ? 'Onboard staff members to allow 1-click Clock In / Clock Out from this console.'
              : 'Try adjusting the search query or status filter.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Staff Member</th>
                <th className="py-3 px-3.5">Role & Department</th>
                <th className="py-3 px-3.5">Check In Today</th>
                <th className="py-3 px-3.5">Check Out Today</th>
                <th className="py-3 px-3.5 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const todayPunch = attendanceRecords.find(
                  (r) =>
                    (r.employeeId === emp.id || r.employeeId === String(emp.id).replace('emp_', '')) &&
                    (r.date === todayStr || !r.date)
                );

                const isClockedIn = todayPunch && todayPunch.checkIn && todayPunch.checkIn !== '--';
                const isClockedOut = isClockedIn && todayPunch.checkOut && todayPunch.checkOut !== '--';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{emp.role}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {emp.department}
                        </span>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="py-3 px-3.5">
                      {isClockedIn ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200">
                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                          {todayPunch.checkIn}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">Not Punched</span>
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="py-3 px-3.5">
                      {isClockedOut ? (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          {todayPunch.checkOut}
                        </span>
                      ) : isClockedIn ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Active Session
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">--</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3.5 text-right">
                      {!isClockedIn ? (
                        <button
                          onClick={() => {
                            setSelectedEmpForPunch(emp);
                            setPunchType('CLOCK_IN');
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Clock In</span>
                        </button>
                      ) : !isClockedOut ? (
                        <button
                          onClick={() => {
                            setSelectedEmpForPunch(emp);
                            setPunchType('CLOCK_OUT');
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Clock Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedEmpForPunch(emp);
                            setPunchType('CLOCK_OUT');
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Completed</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark Attendance Punch Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preSelectedEmployee={selectedEmpForPunch}
        initialPunchType={punchType}
        onSuccess={() => {
          dispatch(fetchAttendanceAsync());
        }}
      />
    </div>
  );
};

