'use client';

import React, { useState, useEffect } from 'react';
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
  Filter,
  Briefcase,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Clock,
  Pencil,
  Trash2,
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

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    dispatch(fetchEmployeesAsync());
    dispatch(fetchAttendanceAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
  }, [dispatch, currentUser?.companyId]);

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

  // Filter Pipeline
  const filteredEmployees = scopedEmployees.filter((e) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.role && e.role.toLowerCase().includes(query)) ||
      (e.department && e.department.toLowerCase().includes(query)) ||
      (e.companyName && e.companyName.toLowerCase().includes(query)) ||
      (e.phone && e.phone.includes(query));

    const matchesCompany =
      isCompanyAdmin || selectedCompany === 'ALL' ||
      (e.companyName && e.companyName.toLowerCase() === selectedCompany.toLowerCase());

    return matchesSearch && matchesCompany;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || (!isCompanyAdmin && selectedCompany !== 'ALL');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCompany('ALL');
  };

  const totalEmployees = scopedEmployees.length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-sm animate-fade-in">
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between shadow-sm animate-shake">
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Employee Directory List</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {userRole === 'SUPER_ADMIN'
              ? 'Super Admin View • Cross-organization staff roster, assigned roles, and official contact directory'
              : `${currentUser?.companyName || 'Organization'} Staff Members, roles, departments and contact details`}
          </p>
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
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Staff</span>
            </Link>
          )}
        </div>
      </div>

      {/* Multi-Tenant Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department, role, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter (Super Admin) */}
          {userRole === 'SUPER_ADMIN' && (
            <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[170px] truncate"
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

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtered Count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{totalEmployees}</strong> staff members
        </span>
      </div>

      {/* Employee Professional Table List View */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-900">No Employees Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isCompanyAdmin
              ? 'No employee records match the active search and filter criteria. Try resetting your filters or onboard a new employee.'
              : 'No staff records found in the directory for the selected search or filters.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            )}
            {isCompanyAdmin && (
              <Link
                href="/employees/new"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Staff</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Employee Member</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Role & Department</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  {isCompanyAdmin && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/employees/${emp.id.replace('emp_', '')}`}
                        className="flex items-center gap-3 group/link cursor-pointer"
                        title={`View monthly attendance calendar for ${emp.name}`}
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 group-hover/link:ring-2 group-hover/link:ring-emerald-500 transition-all"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover/link:text-emerald-600 transition-colors">
                            {emp.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{emp.email}</span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Organization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {emp.companyName || 'Hazree Organization'}
                        </span>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{emp.role}</p>
                        <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                          {emp.department}
                        </span>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{emp.phone || '+91 98000 00000'}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
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
                    </td>

                    {/* Enrolled Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{emp.joinDate || '14/08/2026'}</span>
                      </div>
                    </td>

                    {/* Company Admin Only Columns: Actions (Edit & Delete) */}
                    {isCompanyAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedEmpForEdit(emp);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Employee"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEmpToDelete(emp);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete Employee"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
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

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          employee={selectedEmpForEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmpForEdit(null);
          }}
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
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Staff Member</span>
              <h4 className="text-xs font-extrabold text-slate-900 truncate">{empToDelete?.name}</h4>
              <p className="text-[10px] text-slate-500 truncate">
                {empToDelete?.role} • {empToDelete?.department}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
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
