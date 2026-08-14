'use client';

import React, { useState } from 'react';
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
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Employee, UserRole } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createEmployeeAsync } from '../../redux/slices/employeesSlice';
import { BackendEmployeeCreate } from '../../services/employeesService';

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Engineering',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    avatar: AVATAR_PRESETS[0],
    selectedCompanyId: propCompanyId ? String(propCompanyId).replace('cmp_', '') : (currentCompany ? currentCompany.id.replace('cmp_', '') : '1'),
  });

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

    const resolvedCompanyId = userRole === 'SUPER_ADMIN'
      ? Number(formData.selectedCompanyId)
      : (propCompanyId ? Number(String(propCompanyId).replace('cmp_', '')) : (currentUser?.companyId ? Number(String(currentUser.companyId).replace('cmp_', '')) : (currentCompany?.id ? Number(String(currentCompany.id).replace('cmp_', '')) : undefined)));

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
        if (onSuccess) {
          onSuccess(actionResult.payload);
        }
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setFormData({
            name: '',
            email: '',
            phone: '',
            role: '',
            department: 'Engineering',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            avatar: AVATAR_PRESETS[0],
            selectedCompanyId: propCompanyId ? String(propCompanyId).replace('cmp_', '') : (currentCompany ? currentCompany.id.replace('cmp_', '') : '1'),
          });
        }, 1200);
      } else if (createEmployeeAsync.rejected.match(actionResult)) {
        setErrorMessage((actionResult.payload as string) || 'Failed to add employee.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register employee.');
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

      {isSuccess ? (
        <div className="text-center py-8 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Employee Added Successfully!</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            <strong className="text-slate-800">{formData.name}</strong> ({formData.role}) has been added to the company roster.
          </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              type="tel"
              placeholder="e.g. +91 98201 11223"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                required
              >
                <option value="Engineering">Engineering & Development</option>
                <option value="Human Resources">Human Resources (HR)</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Design & UI">Design & UI/UX</option>
                <option value="Operations">Operations & Logistics</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Role / Title *"
              placeholder="e.g. Senior Software Engineer"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              icon={<Briefcase className="w-4 h-4" />}
              required
            />

            <Input
              label="Date of Joining"
              type="date"
              value={formData.joinDate}
              onChange={(e) => handleChange('joinDate', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
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
