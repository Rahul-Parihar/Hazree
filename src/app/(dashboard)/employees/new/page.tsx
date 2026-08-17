'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Users,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createEmployeeAsync } from '../../../../redux/slices/employeesSlice';
import { fetchCompaniesAsync } from '../../../../redux/slices/companiesSlice';
import { fetchEmployeesAsync } from '../../../../redux/slices/employeesSlice';
import {
  fetchDepartmentsAsync,
  createDepartmentAsync,
} from '../../../../redux/slices/departmentsSlice';
import { BackendEmployeeCreate } from '../../../../services/employeesService';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
];

const FALLBACK_DEPARTMENTS = [
  'Engineering & Development',
  'Operations & Logistics',
  'Sales & Marketing',
  'Human Resources (HR)',
  'Finance & Accounts',
  'Product & Design',
  'Customer Support',
  'Executive Management',
];

export default function NewEmployeePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userRole = useAppSelector((state) => state.auth.userRole);
  const companies = useAppSelector((state) => state.companies.companies);
  const isCreating = useAppSelector((state) => state.employees.isCreating);
  const dbDepartments = useAppSelector((state) => state.departments.departments);

  // Combine dynamic backend departments with fallbacks
  const departmentList = React.useMemo(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name);
    }
    return FALLBACK_DEPARTMENTS;
  }, [dbDepartments]);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    dispatch(fetchEmployeesAsync());
    dispatch(fetchDepartmentsAsync(currentUser?.companyId));
  }, [dispatch, currentUser?.companyId]);

  const currentCompany =
    companies.find(
      (c) =>
        c.id === currentUser?.companyId ||
        c.id === `cmp_${currentUser?.companyId}` ||
        String(c.id).replace('cmp_', '') === String(currentUser?.companyId || '').replace('cmp_', '') ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 ? companies[0] : null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering & Development',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    avatar: AVATAR_PRESETS[0],
    selectedCompanyId: currentCompany ? currentCompany.id.replace('cmp_', '') : '1',
  });

  // Set initial default department once loaded
  useEffect(() => {
    if (departmentList.length > 0 && !departmentList.includes(formData.department)) {
      setFormData((prev) => ({ ...prev, department: departmentList[0] }));
    }
  }, [departmentList]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
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

    const resolvedCompanyId =
      userRole === 'SUPER_ADMIN'
        ? Number(formData.selectedCompanyId)
        : currentUser?.companyId
        ? Number(String(currentUser.companyId).replace('cmp_', ''))
        : currentCompany?.id
        ? Number(String(currentCompany.id).replace('cmp_', ''))
        : undefined;

    const payload: BackendEmployeeCreate = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim(),
      department: formData.department,
      join_date: formData.joinDate,
      status: formData.status,
      avatar: formData.avatar,
      company_id: resolvedCompanyId,
    };

    setErrorMessage(null);

    try {
      const actionResult = await dispatch(createEmployeeAsync(payload));
      if (createEmployeeAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        dispatch(fetchEmployeesAsync());
        dispatch(fetchCompaniesAsync());
        setTimeout(() => {
          router.push('/employees');
        }, 1200);
      } else if (createEmployeeAsync.rejected.match(actionResult)) {
        setErrorMessage(
          (actionResult.payload as string) ||
            'Failed to register employee. Please check email uniqueness.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected network error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Add New Employee
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Staff Onboarding
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Register employee profile and configure attendance access for{' '}
              <strong className="text-slate-800">
                {currentCompany?.name || currentUser?.companyName || 'Organization'}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Organization Quota Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-emerald-700/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {currentCompany?.name?.substring(0, 2).toUpperCase() || 'CO'}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base sm:text-lg truncate">
              {currentCompany?.name || currentUser?.companyName || 'Registered Organization'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span>{currentCompany?.plan || 'Growth Pro'} Plan</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">
                Shift: {currentCompany?.shiftType || '3 Shifts (24x7)'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-right">
          <span className="text-[11px] text-slate-300 block">Current Capacity</span>
          <span className="text-sm font-black text-white">
            {currentCompany?.employeeCount || 0} / {currentCompany?.maxEmployees || 150} Staff Limit
          </span>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Onboarding Failed</p>
            <p className="text-red-700 font-normal">{errorMessage}</p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Employee onboarded successfully! Redirecting to staff roster...</span>
        </div>
      )}

      {/* Full-Screen Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              1. Personal & Contact Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official identity and contact information for attendance notifications
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <Input
                label="Employee Full Name *"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <Input
                label="Official Email Address *"
                type="email"
                placeholder="e.g. aarav@company.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <Input
                label="Contact Phone Number"
                type="tel"
                placeholder="e.g. +91 98201 11223"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Employment Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
              >
                <option value="Active">Active (Full Access & Attendance Active)</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Department & Designation */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              2. Designation & Department Role
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select department configured in the master directory
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Department *</span>
                {dbDepartments && dbDepartments.length > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold lowercase">
                    {dbDepartments.length} available
                  </span>
                )}
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                required
              >
                {dbDepartments && dbDepartments.length > 0 ? (
                  dbDepartments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  departmentList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <Input
                label="Job Role / Title *"
                placeholder="e.g. Senior Software Engineer / HR Manager"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                icon={<Briefcase className="w-4 h-4" />}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <Input
                label="Date of Joining"
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {userRole === 'SUPER_ADMIN' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assign Organization *
                </label>
                <select
                  value={formData.selectedCompanyId}
                  onChange={(e) => handleChange('selectedCompanyId', e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id.replace('cmp_', '')}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Profile Avatar Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              3. Choose Profile Avatar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select biometric display portrait or preset avatar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {AVATAR_PRESETS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange('avatar', url)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  formData.avatar === url
                    ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${idx + 1}`} className="w-14 h-14 object-cover" />
                {formData.avatar === url && (
                  <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/employees"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold transition-all"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isCreating || isSuccess}
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="px-6 py-2.5 text-sm"
          >
            {isCreating ? 'Onboarding Employee...' : 'Save & Onboard Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}
