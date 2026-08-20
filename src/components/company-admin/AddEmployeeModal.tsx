'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Employee, UserRole } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createEmployeeAsync, fetchEmployeesAsync } from '../../redux/slices/employeesSlice';
import { fetchCompaniesAsync } from '../../redux/slices/companiesSlice';
import { fetchDepartmentsAsync } from '../../redux/slices/departmentsSlice';
import { BackendEmployeeCreate } from '../../services/employeesService';
import { getCompanyShiftOptions } from '../../lib/shiftUtils';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newEmployee: Employee) => void;
  companyId?: string | number;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId: propCompanyId,
}) => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const companies = useAppSelector((state) => state.companies.companies);
  const isCreating = useAppSelector((state) => state.employees.isCreating);

  const currentCompany = companies.find(
    (c) =>
      c.id === (propCompanyId ? String(propCompanyId) : currentUser?.companyId) ||
      c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
  ) || (companies.length > 0 ? companies[0] : null);

  const dbDepartments = useAppSelector((state) => state.departments.departments);

  useEffect(() => {
    if (isOpen) {
      const targetCompanyId = propCompanyId || currentUser?.companyId;
      dispatch(fetchDepartmentsAsync(targetCompanyId));
    }
  }, [dispatch, isOpen, propCompanyId, currentUser?.companyId]);

  const departmentList = React.useMemo(() => {
    if (dbDepartments && dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name);
    }
    return [
      'Engineering & Development',
      'Operations & Logistics',
      'Sales & Marketing',
      'Human Resources (HR)',
      'Finance & Accounts',
      'Product & Design',
      'Customer Support',
      'Executive Management',
    ];
  }, [dbDepartments]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering & Development',
    password: 'Hazree@123',
    joinDate: new Date().toISOString().split('T')[0],
    dob: '',
    assignedShift: '',
    status: 'Active',
    avatar: AVATAR_PRESETS[0],
    selectedCompanyId: propCompanyId ? String(propCompanyId).replace('cmp_', '') : (currentCompany ? currentCompany.id.replace('cmp_', '') : '1'),
  });

  // Calculate target company for shift options
  const targetCompany = userRole === 'SUPER_ADMIN'
    ? companies.find((c) => c.id.replace('cmp_', '') === String(formData.selectedCompanyId)) || currentCompany
    : currentCompany;

  const shiftOptions = React.useMemo(() => {
    return getCompanyShiftOptions(targetCompany);
  }, [targetCompany]);

  // Ensure default shift is set from available shift options
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

  // Automatically select the first API department if available
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
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const resolvedCompanyId = userRole === 'SUPER_ADMIN'
      ? Number(formData.selectedCompanyId)
      : (propCompanyId ? Number(String(propCompanyId).replace('cmp_', '')) : (currentUser?.companyId ? Number(String(currentUser.companyId).replace('cmp_', '')) : (currentCompany?.id ? Number(String(currentCompany.id).replace('cmp_', '')) : undefined)));

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
        dispatch(fetchEmployeesAsync());
        dispatch(fetchCompaniesAsync());
        if (onSuccess) {
          onSuccess(actionResult.payload);
        }
      } else if (createEmployeeAsync.rejected.match(actionResult)) {
        setErrorMessage((actionResult.payload as string) || 'Failed to register employee. Please verify details.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected network error occurred.');
    }
  };

  const currentCapacity = currentCompany ? currentCompany.employeeCount : 0;
  const maxCapacity = currentCompany ? currentCompany.maxEmployees : 100;
  const isNearLimit = currentCapacity >= maxCapacity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee (Staff Onboarding)"
      subtitle={`Register employee profile for ${currentCompany?.name || 'Company Portal'}`}
    >
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-sm animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-bold">Onboarding Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {isSuccess && createdCredentials ? (
        <div className="py-4 space-y-5 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Employee Onboarded Successfully!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              <strong className="text-slate-800">{createdCredentials.name}</strong> has been registered. Share these portal login credentials with the employee:
            </p>
          </div>

          {/* Login Credentials Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Employee Portal Credentials
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Login Email</span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">{createdCredentials.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.email, 'email')}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-colors shrink-0"
                  title="Copy email"
                >
                  {copiedKey === 'email' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Password</span>
                  <span className="font-mono font-bold text-slate-800 block">{createdCredentials.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdCredentials.password, 'password')}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-colors shrink-0"
                  title="Copy password"
                >
                  {copiedKey === 'password' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * The employee can now log in at the Customer Portal using these credentials.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setIsSuccess(false);
                setCreatedCredentials(null);
                onClose();
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  role: '',
                  department: 'Engineering & Development',
                  password: 'Hazree@123',
                  joinDate: new Date().toISOString().split('T')[0],
                  dob: '',
                  assignedShift: shiftOptions[0] || 'Shift 1',
                  status: 'Active',
                  avatar: AVATAR_PRESETS[0],
                  selectedCompanyId: propCompanyId ? String(propCompanyId).replace('cmp_', '') : (currentCompany ? currentCompany.id.replace('cmp_', '') : '1'),
                });
              }}
              className="w-full justify-center"
            >
              Done & Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subscription Quota Status Banner */}
          {currentCompany && (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isNearLimit
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200/60 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isNearLimit ? 'text-amber-600' : 'text-emerald-600'}`} />
                <span className="font-semibold">
                  {currentCompany.name} ({currentCompany.plan} Plan)
                </span>
              </div>
              <span className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                {currentCapacity} / {maxCapacity} Staff Limit
              </span>
            </div>
          )}

          {/* Super Admin Organization Picker */}
          {userRole === 'SUPER_ADMIN' && companies.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Assign to Organization *
              </label>
              <select
                value={formData.selectedCompanyId}
                onChange={(e) => handleChange('selectedCompanyId', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id.replace('cmp_', '')}>
                    {c.name} ({c.plan} • {c.employeeCount}/{c.maxEmployees} Staff)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee Full Name *"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Official Email Address *"
              type="email"
              placeholder="e.g. aarav@tatatech.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          {/* Password & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Portal Password *
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set login password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used by employee to log into Customer side</p>
            </div>

            <Input
              label="Contact Phone Number"
              type="tel"
              placeholder="e.g. +91 98201 11223"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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

            <Input
              label="Job Role / Title *"
              placeholder="e.g. Senior Software Engineer"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              icon={<Briefcase className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Joining"
              type="date"
              value={formData.joinDate}
              onChange={(e) => handleChange('joinDate', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Assigned Working Shift (Dynamic per Company Shift Configuration) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              required
            >
              {shiftOptions.map((shift, idx) => (
                <option key={idx} value={shift}>
                  {shift}
                </option>
              ))}
            </select>
          </div>

          {/* Avatar Presets Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Choose Profile Avatar
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChange('avatar', av)}
                  className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    formData.avatar === av
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="Avatar Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none justify-center">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              icon={<UserPlus className="w-4 h-4" />}
              className="flex-1 sm:flex-none justify-center"
            >
              Add Employee
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
