'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  Users,
  Mail,
  Phone,
  Search,
  Building2,
  RotateCcw,
  Calendar,
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { fetchCompaniesAsync } from '../../../redux/slices/companiesSlice';
import {
  fetchEmployeesAsync,
  deleteEmployeeAsync,
  clearEmployeeError,
  clearEmployeeSuccess,
} from '../../../redux/slices/employeesSlice';
import { fetchAttendanceAsync } from '../../../redux/slices/attendanceSlice';
import { fetchDepartmentsAsync } from '../../../redux/slices/departmentsSlice';
import { AddEmployeeModal } from '../../../components/company-admin/AddEmployeeModal';
import { EditEmployeeModal } from '../../../components/company-admin/EditEmployeeModal';
import { MarkAttendanceModal } from '../../../components/company-admin/MarkAttendanceModal';
import { HazreeDataLoader } from '../../../components/ui/HazreeDataLoader';
import { formatShiftBadge } from '../../../lib/shiftUtils';
import { Employee } from '../../../types';

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const employees = useAppSelector((state) => state.employees.employees);
  const isLoading = useAppSelector((state) => state.employees.isLoading);
  const successMessage = useAppSelector((state) => state.employees.successMessage);
  const errorMessage = useAppSelector((state) => state.employees.error);
  const companies = useAppSelector((state) => state.companies.companies);
  const attendanceRecords = useAppSelector((state) => state.attendance.records);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEmpForPunch, setSelectedEmpForPunch] = useState<Employee | null>(null);
  const [punchType, setPunchType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');

  // Edit & Delete Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters State (Shift categories: ALL, Shift 1, Shift 2, Shift 3)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState<'ALL' | 'Shift 1' | 'Shift 2' | 'Shift 3'>('ALL');

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    dispatch(fetchEmployeesAsync());
    dispatch(fetchAttendanceAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchEmployeesAsync());
    dispatch(fetchAttendanceAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
  };

  // Scoped employees: Company Admin sees only their organization's employees, Super Admin sees all
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN';
  const myCompanyId = currentUser?.companyId ? String(currentUser.companyId).replace('cmp_', '') : undefined;
  const myCompanyName = currentUser?.companyName?.trim().toLowerCase();

  const scopedEmployees = isCompanyAdmin
    ? employees.filter((e) => {
      const empCompId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
      if (myCompanyId && empCompId) return empCompId === myCompanyId;
      if (myCompanyName && e.companyName) return e.companyName.trim().toLowerCase() === myCompanyName;
      return true;
    })
    : employees;

  // Extract distinct companies from data (for Super Admin filter dropdown)
  const distinctCompanies = Array.from(
    new Set([
      ...companies.map((c) => c.name),
      ...employees.map((e) => e.companyName).filter(Boolean),
    ])
  );

  // Shift Category Counts
  const shiftStats = useMemo(() => {
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    let clockedInCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    scopedEmployees.forEach((e) => {
      const shiftStr = (e.assignedShift || '').toLowerCase();
      if (shiftStr.includes('shift 2') || shiftStr.includes('evening') || shiftStr.includes('afternoon')) {
        s2++;
      } else if (shiftStr.includes('shift 3') || shiftStr.includes('night')) {
        s3++;
      } else {
        // Shift 1 default
        s1++;
      }

      const todayPunch = attendanceRecords.find(
        (r) =>
          (r.employeeId === e.id || r.employeeId === String(e.id).replace('emp_', '')) &&
          (r.date === todayStr || !r.date) &&
          r.checkIn &&
          r.checkIn !== '--'
      );
      if (todayPunch) {
        clockedInCount++;
      }
    });

    return {
      shift1: s1,
      shift2: s2,
      shift3: s3,
      clockedIn: clockedInCount,
      total: scopedEmployees.length,
    };
  }, [scopedEmployees, attendanceRecords]);

  // Filter Pipeline with Clean Shift Category Matching
  const filteredEmployees = useMemo(() => {
    return scopedEmployees.filter((e) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        e.name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        (e.role && e.role.toLowerCase().includes(query)) ||
        (e.department && e.department.toLowerCase().includes(query)) ||
        (e.companyName && e.companyName.toLowerCase().includes(query)) ||
        (e.assignedShift && e.assignedShift.toLowerCase().includes(query)) ||
        (e.phone && e.phone.includes(query));

      const matchesCompany =
        isCompanyAdmin ||
        selectedCompany === 'ALL' ||
        (e.companyName && e.companyName.toLowerCase() === selectedCompany.toLowerCase());

      const shiftStr = (e.assignedShift || '').toLowerCase();
      let matchesShift = true;
      if (selectedShift === 'Shift 1') {
        matchesShift =
          shiftStr.includes('shift 1') ||
          shiftStr.includes('morning') ||
          shiftStr.includes('day') ||
          shiftStr.includes('general') ||
          !shiftStr;
      } else if (selectedShift === 'Shift 2') {
        matchesShift =
          shiftStr.includes('shift 2') ||
          shiftStr.includes('evening') ||
          shiftStr.includes('afternoon');
      } else if (selectedShift === 'Shift 3') {
        matchesShift = shiftStr.includes('shift 3') || shiftStr.includes('night');
      }

      return matchesSearch && matchesCompany && matchesShift;
    });
  }, [scopedEmployees, searchQuery, selectedCompany, selectedShift, isCompanyAdmin]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (!isCompanyAdmin && selectedCompany !== 'ALL') ||
    selectedShift !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCompany('ALL');
    setSelectedShift('ALL');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearEmployeeSuccess())}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearEmployeeError())}
            className="text-xs font-bold text-rose-700 hover:text-rose-950 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Staff Roster & Shift Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {userRole === 'SUPER_ADMIN'
                  ? 'Cross-organization employee roster, assigned shift slots, and official contact directory'
                  : `${currentUser?.companyName || 'Organization'} Staff Directory • Live Shift Assignments & Verification`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>

          {isCompanyAdmin && (
            <Button
              variant="outline"
              size="sm"
              icon={<Clock className="w-4 h-4 text-emerald-600" />}
              onClick={() => {
                setSelectedEmpForPunch(null);
                setIsAttendanceModalOpen(true);
              }}
            >
              Clock In
            </Button>
          )}

          {isCompanyAdmin && (
            <Link
              href="/employees/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Staff</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search & Shift Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department, role, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50/90 px-3 py-2 rounded-2xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              <option value="Shift 1">Shift 1</option>
              <option value="Shift 2">Shift 2</option>
              <option value="Shift 3">Shift 3</option>
            </select>
          </div>

          {/* Company Filter (Super Admin Only) */}
          {userRole === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-1.5 bg-slate-50/90 px-3 py-2 rounded-2xl border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                <option value="ALL">All Organizations</option>
                {distinctCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtered Count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{scopedEmployees.length}</strong> staff members
        </span>
        {selectedShift !== 'ALL' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            Active Filter: <strong>{selectedShift}</strong>
          </span>
        )}
      </div>

      {/* Employee Professional Table List View */}
      {isLoading && employees.length === 0 ? (
        <HazreeDataLoader type="table-skeleton" rows={6} />
      ) : filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-slate-900">No Employees Found in {selectedShift}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'No staff members match the active search or shift filter. Try selecting "All Shifts" or clearing your search.'
              : 'No staff records found in the directory. You can onboard new team members anytime.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            )}
            {isCompanyAdmin && (
              <Link
                href="/employees/new"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Staff</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1350px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-6 min-w-[200px]">Employee Member</th>
                  <th className="py-4 px-6 min-w-[170px]">Organization</th>
                  <th className="py-4 px-6 min-w-[140px]">Job Role</th>
                  <th className="py-4 px-6 min-w-[180px]">Department</th>
                  <th className="py-4 px-6 min-w-[160px]">Assigned Shift</th>
                  <th className="py-4 px-6 min-w-[160px]">Contact Phone</th>
                  <th className="py-4 px-6 min-w-[160px]">Status & Hazree</th>
                  <th className="py-4 px-6 min-w-[140px]">Enrolled Date</th>
                  {isCompanyAdmin && (
                    <th className="py-4 px-6 min-w-[100px] text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEmployees.map((emp) => {
                  const shiftBadgeInfo = formatShiftBadge(emp.assignedShift);
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group whitespace-nowrap"
                    >
                      {/* Employee Profile: Only Name */}
                      <td className="py-4 px-6">
                        <Link
                          href={`/employees/${emp.id.replace('emp_', '')}`}
                          className="flex items-center gap-3 group/link cursor-pointer"
                          title={`View monthly attendance calendar for ${emp.name}`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-9 h-9 rounded-2xl object-cover border border-slate-200/80 shadow-xs group-hover/link:ring-2 group-hover/link:ring-emerald-500 transition-all"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          </div>
                          <span className="font-bold text-slate-900 text-sm group-hover/link:text-emerald-600 transition-colors">
                            {emp.name}
                          </span>
                        </Link>
                      </td>

                      {/* Organization */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-bold text-slate-800">
                            {emp.companyName || 'Hazree Organization'}
                          </span>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{emp.role}</span>
                      </td>

                      {/* Department Column */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-xl whitespace-nowrap">
                          {emp.department}
                        </span>
                      </td>

                      {/* Assigned Shift Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border shadow-2xs whitespace-nowrap ${shiftBadgeInfo.color}`}
                          title={emp.assignedShift || 'Shift 1'}
                        >
                          <span className="text-sm">{shiftBadgeInfo.icon}</span>
                          <span>{shiftBadgeInfo.label}</span>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-xs">{emp.phone || '+91 98000 00000'}</span>
                        </div>
                      </td>

                      {/* Status & Today Check-In Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                          <Badge
                            variant={
                              emp.status === 'Active'
                                ? 'active'
                                : emp.status === 'On Leave'
                                  ? 'pending'
                                  : 'neutral'
                            }
                          >
                            {emp.status}
                          </Badge>
                          {(() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            const todayPunch = attendanceRecords.find(
                              (r) =>
                                (r.employeeId === emp.id || r.employeeId === String(emp.id).replace('emp_', '')) &&
                                (r.date === todayStr || !r.date)
                            );
                            if (todayPunch && todayPunch.checkIn && todayPunch.checkIn !== '--') {
                              const isLate = todayPunch.status === 'Late';
                              return (
                                <div
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap ${
                                    isLate
                                      ? 'text-amber-900 bg-amber-50 border-amber-200'
                                      : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                  }`}
                                >
                                  {isLate ? (
                                    <>
                                      <span className="text-amber-600 font-black">❗</span>
                                      <span>In: {todayPunch.checkIn} (Late)</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>In: {todayPunch.checkIn}</span>
                                    </>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>

                      {/* Enrolled Date */}
                      <td className="py-4 px-6 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{emp.joinDate || '14/08/2026'}</span>
                        </div>
                      </td>

                      {/* Company Admin Only Columns: Actions (Edit & Delete) */}
                      {isCompanyAdmin && (
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/employees/${emp.id.replace('emp_', '')}/edit`}
                              title="Edit Employee Details (Full Page Form)"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setEmpToDelete(emp);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Delete Employee"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            dispatch(fetchEmployeesAsync());
            dispatch(fetchCompaniesAsync());
          }}
        />
      )}

      {/* Delete Employee Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmpToDelete(null);
        }}
        title="Delete Employee"
        subtitle="Confirm employee removal"
        maxWidth="sm"
      >
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Staff Member</span>
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{empToDelete?.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                {empToDelete?.role} • {empToDelete?.department}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Are you sure you want to remove <span className="font-bold text-slate-900">"{empToDelete?.name}"</span> from the staff roster?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEmpToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!empToDelete) return;
                setIsDeleting(true);
                try {
                  await dispatch(deleteEmployeeAsync(empToDelete.id));
                  setIsDeleteModalOpen(false);
                  setEmpToDelete(null);
                  dispatch(fetchEmployeesAsync());
                  dispatch(fetchCompaniesAsync());
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Attendance Modal (Company Admin Only) */}
      {isCompanyAdmin && (
        <MarkAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          preSelectedEmployee={selectedEmpForPunch}
          initialPunchType={punchType}
          onSuccess={() => {
            dispatch(fetchAttendanceAsync());
          }}
        />
      )}
    </div>
  );
}
