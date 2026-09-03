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
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { createEmployeeAsync } from '../../../../redux/slices/employeesSlice';
import { fetchCompaniesAsync } from '../../../../redux/slices/companiesSlice';
import { fetchEmployeesAsync } from '../../../../redux/slices/employeesSlice';
import { fetchDepartmentsAsync } from '../../../../redux/slices/departmentsSlice';
import { BackendEmployeeCreate } from '../../../../services/employeesService';
import { getCompanyShiftOptions } from '../../../../lib/shiftUtils';
import { RolePermissionManager } from '../../../../components/company-admin/RolePermissionManager';
import { PortalAccessRole, EmployeePermissions } from '../../../../types';
import { STAFF_PRESET_PERMISSIONS } from '../../../../lib/permissionUtils';
import { toast } from 'sonner';

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

export default function NewEmployeePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userRole = useAppSelector((state) => state.auth.userRole);
  const companies = useAppSelector((state) => state.companies.companies);
  const isCreating = useAppSelector((state) => state.employees.isCreating);
  const dbDepartments = useAppSelector((state) => state.departments.departments);

  // Dynamic departments fetched from database
  const departmentList = React.useMemo(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name);
    }
    return [];
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
    department: '',
    password: 'Hazree@123',
    joinDate: new Date().toISOString().split('T')[0],
    dob: '',
    assignedShift: '',
    status: 'Active',
    avatar: AVATAR_PRESETS[0],
    selectedCompanyId: currentCompany ? currentCompany.id.replace('cmp_', '') : '1',
    portalAccess: 'NONE' as PortalAccessRole,
    permissions: STAFF_PRESET_PERMISSIONS as EmployeePermissions,
  });

  const canAssignPortalRole =
    userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'MANAGER';

  const targetCompany = userRole === 'SUPER_ADMIN'
    ? companies.find((c) => c.id.replace('cmp_', '') === String(formData.selectedCompanyId)) || currentCompany
    : currentCompany;

  const shiftOptions = React.useMemo(() => {
    return getCompanyShiftOptions(targetCompany);
  }, [targetCompany]);

  useEffect(() => {
    if (shiftOptions.length > 0 && (!formData.assignedShift || !shiftOptions.includes(formData.assignedShift))) {
      setFormData((prev) => ({ ...prev, assignedShift: shiftOptions[0] }));
    }
  }, [shiftOptions]);

  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; name: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${key === 'email' ? 'Email' : 'Password'} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
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

    if (!formData.password.trim() || formData.password.length < 4) {
      setErrorMessage('Login password must be at least 4 characters long.');
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

    const rawPassword = formData.password.trim();
    const payload: BackendEmployeeCreate = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: rawPassword,
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim(),
      department: formData.department,
      join_date: formData.joinDate,
      dob: formData.dob.trim() || undefined,
      assigned_shift: formData.assignedShift || shiftOptions[0] || 'Shift 1',
      status: formData.status,
      avatar: formData.avatar,
      portal_access: canAssignPortalRole ? formData.portalAccess : 'NONE',
      permissions: canAssignPortalRole ? formData.permissions : STAFF_PRESET_PERMISSIONS,
      company_id: resolvedCompanyId,
    };

    setErrorMessage(null);

    try {
      const actionResult = await dispatch(createEmployeeAsync(payload));
      if (createEmployeeAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        setCreatedCredentials({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: rawPassword,
        });
        toast.success(`Employee ${payload.name} onboarded successfully!`);
        dispatch(fetchEmployeesAsync());
        dispatch(fetchCompaniesAsync());
      } else if (createEmployeeAsync.rejected.match(actionResult)) {
        const err =
          (actionResult.payload as string) ||
          'Failed to register employee. Please check email uniqueness.';
        setErrorMessage(err);
        toast.error(err);
      }
    } catch (err: any) {
      const errM = err?.message || 'Unexpected network error occurred.';
      setErrorMessage(errM);
      toast.error(errM);
    }
  };

  const handleResetForNew = () => {
    setIsSuccess(false);
    setCreatedCredentials(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: departmentList[0] || 'Engineering & Development',
      password: 'Hazree@123',
      joinDate: new Date().toISOString().split('T')[0],
      dob: '',
      assignedShift: shiftOptions[0] || 'Shift 1',
      status: 'Active',
      avatar: AVATAR_PRESETS[0],
      selectedCompanyId: currentCompany ? currentCompany.id.replace('cmp_', '') : '1',
      portalAccess: 'NONE',
      permissions: STAFF_PRESET_PERMISSIONS,
    });
  };

  const currentCapacity = targetCompany ? targetCompany.employeeCount : 0;
  const maxCapacity = targetCompany ? targetCompany.maxEmployees : 100;
  const isNearLimit = currentCapacity >= maxCapacity;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/employees" className="hover:text-slate-900 transition-colors">
          Staff Roster
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-emerald-700 font-bold">New Employee Onboarding</span>
      </div>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link
            href="/employees"
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
            title="Back to staff roster"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Add New Employee (Staff Onboarding)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Full Page Form
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Register employee profile and configure shift timing for{' '}
              <strong className="text-slate-800">
                {targetCompany?.name || currentUser?.companyName || 'Organization'}
              </strong>
            </p>
          </div>
        </div>

        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          <span>View Staff Roster</span>
        </Link>
      </div>

      {/* Organization Quota Banner */}
      {targetCompany && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
          isNearLimit
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/50'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center shadow-md shrink-0 ${
              isNearLimit ? 'bg-amber-200 text-amber-900' : 'bg-white text-emerald-900'
            }`}>
              {targetCompany?.name?.substring(0, 2).toUpperCase() || 'CO'}
            </div>
            <div className="min-w-0">
              <h3 className={`font-extrabold text-base sm:text-lg truncate ${isNearLimit ? 'text-amber-950' : 'text-white'}`}>
                {targetCompany?.name}
              </h3>
              <p className={`text-xs mt-0.5 flex items-center gap-2 ${isNearLimit ? 'text-amber-750' : 'text-slate-300'}`}>
                <span>{targetCompany?.plan || 'Growth Pro'} Plan</span>
                <span>•</span>
                <span className={isNearLimit ? 'text-amber-800 font-bold' : 'text-emerald-300 font-semibold'}>
                  {targetCompany?.shiftType || (targetCompany?.shiftCount ? `${targetCompany.shiftCount} Shifts` : 'Active Shift System')}
                </span>
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl border text-right ${
            isNearLimit ? 'bg-white/80 border-amber-300 text-amber-900' : 'bg-white/10 border-white/20 text-white'
          }`}>
            <span className={`text-[11px] block font-medium ${isNearLimit ? 'text-amber-800' : 'text-slate-300'}`}>
              Capacity Usage
            </span>
            <span className="text-sm font-black">
              {currentCapacity} / {maxCapacity} Staff Limit
            </span>
          </div>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Onboarding Failed</p>
            <p className="text-rose-700 font-normal mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Success View with Copyable Portal Credentials */}
      {isSuccess && createdCredentials ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Employee Onboarded Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              <strong className="text-slate-900">{createdCredentials.name}</strong> has been registered into the staff directory. Share these portal login credentials with the employee:
            </p>
          </div>

          {/* Login Credentials Box */}
          <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Employee Customer Portal Credentials
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active Account
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Login Email Address</span>
                  <span className="font-mono font-bold text-slate-900 truncate block mt-0.5">{createdCredentials.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.email, 'email')}
                  className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all shrink-0 cursor-pointer"
                  title="Copy email"
                >
                  {copiedKey === 'email' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Portal Password</span>
                  <span className="font-mono font-extrabold text-slate-900 block mt-0.5">{createdCredentials.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.password, 'password')}
                  className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all shrink-0 cursor-pointer"
                  title="Copy password"
                >
                  {copiedKey === 'password' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              * The employee can use these credentials to log into the Customer Portal app or kiosk to record clock-in punches and apply for leaves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForNew}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Another Employee
            </Button>
            <Link
              href="/employees"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Back to Staff Roster</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Full-Screen Form Container */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Super Admin Organization Picker */}
          {userRole === 'SUPER_ADMIN' && companies.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Select Target Organization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin control: choose which organization this employee belongs to
                </p>
              </div>

              <div>
                <select
                  value={formData.selectedCompanyId}
                  onChange={(e) => handleChange('selectedCompanyId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id.replace('cmp_', '')}>
                      {c.name} ({c.plan} • {c.employeeCount}/{c.maxEmployees} Staff)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 1: Personal & Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                1. Personal & Contact Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official employee identity and customer portal login credentials
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Portal Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="e.g. Hazree@123"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Used by employee to log into the Customer Portal app</p>
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Employment Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="Active">Active (Full Attendance Access)</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Department, Role & Working Shift */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                2. Designation, Department & Shift Assignment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign job designation and working shift schedule
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
                    <>
                      <option value="" disabled>Select Department</option>
                      {dbDepartments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      No departments created yet (Add via Departments menu)
                    </option>
                  )}
                </select>
              </div>

              <div>
                <Input
                  label="Job Role / Title *"
                  placeholder="e.g. Senior Software Engineer"
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
              <div>
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Assigned Working Shift */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Assigned Working Shift *</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {targetCompany?.shiftCount ? `${targetCompany.shiftCount} Shift Company` : 'Active Shift'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select which shift this employee will work in based on {targetCompany?.name || 'company'} schedule
              </p>
              <select
                value={formData.assignedShift}
                onChange={(e) => handleChange('assignedShift', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                required
              >
                {shiftOptions.map((shift, idx) => (
                  <option key={idx} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Admin Portal Access & Permissions (Only Company Owner & Manager) */}
          {canAssignPortalRole && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  3. Admin Portal Access & Permissions (Optional)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  By default, employee is created as Standard Staff. You can grant HR Admin, Manager, or Custom permissions now or anytime later.
                </p>
              </div>

              <RolePermissionManager
                portalAccess={formData.portalAccess}
                permissions={formData.permissions}
                onChange={(role, perms) => {
                  setFormData((prev) => ({
                    ...prev,
                    portalAccess: role,
                    permissions: perms,
                  }));
                }}
              />
            </div>
          )}

          {/* Section: Profile Avatar Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {canAssignPortalRole ? '4. Choose Profile Avatar' : '3. Choose Profile Avatar'}
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
              icon={<UserPlus className="w-4 h-4" />}
              className="px-6 py-2.5 text-sm"
            >
              {isCreating ? 'Onboarding Employee...' : 'Save & Onboard Employee'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
