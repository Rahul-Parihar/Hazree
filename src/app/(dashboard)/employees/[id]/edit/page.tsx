'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Save,
  Check,
} from 'lucide-react';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../../../redux/hooks';
import {
  fetchEmployeesAsync,
  updateEmployeeAsync,
} from '../../../../../redux/slices/employeesSlice';
import { fetchCompaniesAsync } from '../../../../../redux/slices/companiesSlice';
import {
  fetchDepartmentsAsync,
  createDepartmentAsync,
} from '../../../../../redux/slices/departmentsSlice';
import { BackendEmployeeCreate } from '../../../../../services/employeesService';
import { getCompanyShiftOptions } from '../../../../../lib/shiftUtils';
import { EmployeeStatus } from '../../../../../types';

const AVATAR_PRESETS = [
  { name: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 6', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 7', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80' },
  { name: 'Avatar 8', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
];

const FALLBACK_DEPARTMENTS = [
  'Engineering & Development',
  'Operations & Logistics',
  'Sales & Marketing',
  'Human Resources (HR)',
  'Finance & Accounts',
  'Product & Design',
  'Customer Support',
  'Quality Assurance (QA)',
  'Executive Management',
];

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const rawParamId = Array.isArray(params.id) ? params.id[0] : params.id;
  const employeeId = rawParamId ? String(rawParamId).replace('emp_', '') : '';

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const employees = useAppSelector((state) => state.employees.employees);
  const companies = useAppSelector((state) => state.companies.companies);
  const dbDepartments = useAppSelector((state) => state.departments.departments);
  const isUpdating = useAppSelector((state) => state.employees.isUpdating);

  // Find target employee
  const targetEmployee = useMemo(() => {
    return employees.find(
      (e) =>
        e.id === `emp_${employeeId}` ||
        e.id === employeeId ||
        String(e.id).replace('emp_', '') === employeeId
    );
  }, [employees, employeeId]);

  // Find employee's company
  const targetCompany = useMemo(() => {
    if (!targetEmployee) return null;
    return (
      companies.find(
        (c) =>
          c.id === targetEmployee.companyId ||
          c.id === `cmp_${targetEmployee.companyId}` ||
          String(c.id).replace('cmp_', '') === String(targetEmployee.companyId || '').replace('cmp_', '') ||
          c.name.toLowerCase() === (targetEmployee.companyName || '').toLowerCase()
      ) || null
    );
  }, [companies, targetEmployee]);

  // Dynamic Shift Options based on company configuration
  const shiftOptions = useMemo(() => {
    return getCompanyShiftOptions(targetCompany);
  }, [targetCompany]);

  // Combine dynamic backend departments with fallbacks
  const departmentList = useMemo(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name);
    }
    return FALLBACK_DEPARTMENTS;
  }, [dbDepartments]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering & Development',
    password: '',
    joinDate: new Date().toISOString().split('T')[0],
    dob: '',
    assignedShift: 'Shift 1: 09:00 AM - 06:00 PM (9h)',
    status: 'Active' as EmployeeStatus,
    avatar: AVATAR_PRESETS[0].url,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    dispatch(fetchEmployeesAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
  }, [dispatch, currentUser?.companyId]);

  // Pre-fill form when targetEmployee is loaded
  useEffect(() => {
    if (targetEmployee) {
      setFormData({
        name: targetEmployee.name || '',
        email: targetEmployee.email || '',
        phone: targetEmployee.phone || '',
        role: targetEmployee.role || '',
        department: targetEmployee.department || 'Engineering & Development',
        password: '',
        joinDate: targetEmployee.joinDate || new Date().toISOString().split('T')[0],
        dob: targetEmployee.dob || '',
        assignedShift: targetEmployee.assignedShift || (shiftOptions[0] || 'Shift 1'),
        status: targetEmployee.status || 'Active',
        avatar: targetEmployee.avatar || AVATAR_PRESETS[0].url,
      });
    }
  }, [targetEmployee, shiftOptions]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleAddNewDepartment = async () => {
    if (!newDeptName.trim()) return;
    setIsAddingDept(true);
    try {
      const compId = targetEmployee?.companyId
        ? Number(String(targetEmployee.companyId).replace('cmp_', ''))
        : currentUser?.companyId
          ? Number(String(currentUser.companyId).replace('cmp_', ''))
          : undefined;

      await dispatch(
        createDepartmentAsync({
          name: newDeptName.trim(),
          description: `${newDeptName.trim()} Department`,
          company_id: compId,
        })
      );
      setFormData((prev) => ({ ...prev, department: newDeptName.trim() }));
      setNewDeptName('');
      setShowNewDeptInput(false);
    } finally {
      setIsAddingDept(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Employee full name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Official email address is required.');
      return;
    }

    if (!formData.role.trim()) {
      setErrorMessage('Designation / Job Role is required.');
      return;
    }

    if (formData.password.trim() && formData.password.length < 4) {
      setErrorMessage('New login password must be at least 4 characters long.');
      return;
    }

    const payload: Partial<BackendEmployeeCreate> = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim(),
      department: formData.department,
      join_date: formData.joinDate,
      dob: formData.dob.trim() || undefined,
      assigned_shift: formData.assignedShift || shiftOptions[0] || 'Shift 1',
      status: formData.status,
      avatar: formData.avatar,
    };

    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    setErrorMessage(null);

    try {
      const actionResult = await dispatch(
        updateEmployeeAsync({
          id: employeeId,
          data: payload,
        })
      );

      if (updateEmployeeAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        dispatch(fetchEmployeesAsync());
        setTimeout(() => {
          router.push('/employees');
        }, 1200);
      } else if (updateEmployeeAsync.rejected.match(actionResult)) {
        setErrorMessage(
          (actionResult.payload as string) || 'Failed to update employee details. Please verify entries.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred while updating employee.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-16">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="p-2.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-600" />
              <span>Edit Staff Member Details</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {targetEmployee
                ? `Update staff information, department, shift assignment, and credentials for ${targetEmployee.name}`
                : 'Modify employee credentials, shift assignments, and profile'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {targetEmployee && (
            <Link
              href={`/employees/${employeeId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Monthly Calendar</span>
            </Link>
          )}
          <Link href="/employees">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm text-emerald-900">Employee Profile Updated Successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                Changes saved for {formData.name}. Redirecting back to directory...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-center justify-between shadow-xs animate-shake">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-rose-900">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-black text-rose-700 hover:text-rose-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Single Comprehensive Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Personal Information & Employment Details</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Full legal name, official contact details, job role, department, and assigned shift
              </p>
            </div>
          </div>

          {/* Row 1: Full Name & Official Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Full Legal Name *"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <Input
              label="Official Contact Phone"
              placeholder="Enter Your Contact Number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          {/* Row 2: Official Email & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Official Email Address *"
              type="email"
              placeholder="e.g. aarav@company.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />

            <Input
              label="Job Role / Designation *"
              placeholder="e.g. Senior Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              required
            />
          </div>

          {/* Row 3: Department & Assigned Shift Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Department Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Department *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewDeptInput(!showNewDeptInput)}
                  className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700"
                >
                  {showNewDeptInput ? 'Cancel' : '+ Add Department'}
                </button>
              </div>

              {showNewDeptInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New department name"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 placeholder:font-normal px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewDepartment}
                    disabled={isAddingDept || !newDeptName.trim()}
                  >
                    {isAddingDept ? 'Saving...' : 'Add'}
                  </Button>
                </div>
              ) : (
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {departmentList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Assigned Shift Slot Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assigned Shift Slot *</span>
              </label>
              <select
                value={formData.assignedShift}
                onChange={(e) => setFormData((prev) => ({ ...prev, assignedShift: e.target.value }))}
                className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                {shiftOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Status & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Employment Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as EmployeeStatus }))
                }
                className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="Active">Active (Full Access & Attendance)</option>
                <option value="On Leave">On Leave (Temporary Leave Status)</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>

            <Input
              label="Date of Birth (DOB)"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
            />
          </div>

          {/* Row 5: Joining Date & Portal Password Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, joinDate: e.target.value }))}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Portal Login Password (Optional)
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Strong</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 placeholder:font-normal px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 6: Profile Photo / Avatar Picker (Placed at Bottom) */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Profile Photo / Avatar
                </label>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Select a representative avatar image for the staff member
                </p>
              </div>

              {/* Active Avatar Badge */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <img
                  src={formData.avatar}
                  alt="Selected"
                  className="w-6 h-6 rounded-lg object-cover border border-emerald-500"
                />
                <span className="text-xs font-black text-slate-800">Current Photo</span>
              </div>
            </div>

            {/* Avatar Gallery */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = formData.avatar === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.url }))}
                    className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all cursor-pointer ${isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs scale-102'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                  >
                    <div className="relative">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black tracking-tight ${isSelected ? 'text-emerald-900' : 'text-slate-500 group-hover:text-slate-800'
                        }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/employees"
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-black text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 text-center transition-all shadow-2xs"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="lg"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 font-black"
            icon={<Save className="w-4 h-4" />}
          >
            {isUpdating ? 'Saving Changes...' : 'Save & Update Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}
