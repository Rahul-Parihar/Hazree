'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Save,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Employee, EmployeeStatus } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateEmployeeAsync } from '../../redux/slices/employeesSlice';
import { fetchDepartmentsAsync } from '../../redux/slices/departmentsSlice';
import { BackendEmployeeCreate } from '../../services/employeesService';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess?: (updated: Employee) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
];

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const dbDepartments = useAppSelector((state) => state.departments.departments);
  const isLoading = useAppSelector((state) => state.employees.isLoading);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    password: '',
    status: 'Active' as EmployeeStatus,
    joinDate: '',
    dob: '',
    avatar: AVATAR_PRESETS[0],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      dispatch(fetchDepartmentsAsync());
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        role: employee.role || '',
        department: employee.department || '',
        password: '',
        status: employee.status || 'Active',
        joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
        dob: employee.dob || '',
        avatar: employee.avatar || AVATAR_PRESETS[0],
      });
      setErrorMessage(null);
      setShowPassword(false);
    }
  }, [isOpen, employee, dispatch]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!formData.name.trim()) {
      setErrorMessage('Employee name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Official email address is required.');
      return;
    }

    if (!formData.role.trim()) {
      setErrorMessage('Job role / designation is required.');
      return;
    }

    if (formData.password.trim() && formData.password.trim().length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    const payload: Partial<BackendEmployeeCreate> = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: formData.role.trim(),
      department: formData.department,
      status: formData.status,
      join_date: formData.joinDate,
      dob: formData.dob.trim() || undefined,
      avatar: formData.avatar,
    };

    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    try {
      const actionResult = await dispatch(
        updateEmployeeAsync({ id: employee.id, data: payload })
      );

      if (updateEmployeeAsync.fulfilled.match(actionResult)) {
        if (onSuccess) {
          onSuccess(actionResult.payload);
        }
        onClose();
      } else if (updateEmployeeAsync.rejected.match(actionResult)) {
        setErrorMessage((actionResult.payload as string) || 'Failed to update employee details.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update employee.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee Profile"
      subtitle={`Update details for ${employee?.name || 'Staff Member'}`}
      maxWidth="md"
    >
      {errorMessage && (
        <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            placeholder="e.g. Aarav Sharma"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Official Email *"
            type="email"
            placeholder="e.g. aarav@company.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98201 11223"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />

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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              required
            >
              {dbDepartments && dbDepartments.length > 0 ? (
                dbDepartments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))
              ) : (
                <option value={formData.department}>{formData.department || 'Select Department'}</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Designation / Role *"
            placeholder="e.g. Senior Developer"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            icon={<Briefcase className="w-4 h-4" />}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Employment Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reset Password (optional)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave blank to keep unchanged"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                icon={<Lock className="w-4 h-4" />}
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
            <span className="text-[10px] text-slate-400">Leave empty to keep current password</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Profile Avatar
          </label>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {AVATAR_PRESETS.map((av, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange('avatar', av)}
                className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  formData.avatar === av
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={av} alt="Avatar" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
