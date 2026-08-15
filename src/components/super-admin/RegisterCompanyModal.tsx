'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, User, Mail, Phone, MapPin, Layers, Users, CheckCircle2, AlertCircle, ExternalLink, Lock, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Company, PlanType } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { createCompanyAsync } from '../../redux/slices/companiesSlice';
import { companiesService, subscriptionsService, BackendSubscriptionPlan } from '../../services';

interface RegisterCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (newCompany: Company) => void;
}

export const RegisterCompanyModal: React.FC<RegisterCompanyModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const dispatch = useAppDispatch();

  const [availablePlans, setAvailablePlans] = useState<BackendSubscriptionPlan[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    location: '',
    plan: 'Growth' as PlanType,
    maxEmployees: 100,
    shiftCount: 3,
    shiftHours: 8,
    shiftType: '3 Shifts • 8 Hours (24x7 Rotational)',
    shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
  });

  React.useEffect(() => {
    if (isOpen) {
      subscriptionsService.getPlans().then((data) => {
        if (data && data.length > 0) {
          setAvailablePlans(data);
        }
      }).catch((err) => console.error(err));
    }
  }, [isOpen]);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculateShiftPreset = (count: number, hours: number) => {
    if (count === 1) {
      if (hours === 8) {
        return {
          shiftCount: 1,
          shiftHours: 8,
          shiftType: '1 Shift • 8 Hours (General Day)',
          shiftTimings: 'General Shift: 09:00 AM - 05:00 PM (8 hrs)',
        };
      } else if (hours === 12) {
        return {
          shiftCount: 1,
          shiftHours: 12,
          shiftType: '1 Shift • 12 Hours (Extended Shift)',
          shiftTimings: 'Day Shift: 08:00 AM - 08:00 PM (12 hrs)',
        };
      } else if (hours === 6) {
        return {
          shiftCount: 1,
          shiftHours: 6,
          shiftType: '1 Shift • 6 Hours (Part-time Shift)',
          shiftTimings: 'Morning Shift: 09:00 AM - 03:00 PM (6 hrs)',
        };
      } else {
        return {
          shiftCount: 1,
          shiftHours: 9,
          shiftType: '1 Shift • 9 Hours (General Day)',
          shiftTimings: 'General Shift: 09:00 AM - 06:00 PM (9 hrs)',
        };
      }
    } else if (count === 2) {
      if (hours === 12) {
        return {
          shiftCount: 2,
          shiftHours: 12,
          shiftType: '2 Shifts • 12 Hours (Day & Night 24h)',
          shiftTimings: 'Shift 1 (Day): 08:00 AM - 08:00 PM (12h) | Shift 2 (Night): 08:00 PM - 08:00 AM (12h)',
        };
      } else if (hours === 9) {
        return {
          shiftCount: 2,
          shiftHours: 9,
          shiftType: '2 Shifts • 9 Hours (Day & Evening)',
          shiftTimings: 'Shift 1: 08:00 AM - 05:00 PM (9h) | Shift 2: 02:00 PM - 11:00 PM (9h)',
        };
      } else {
        return {
          shiftCount: 2,
          shiftHours: 8,
          shiftType: '2 Shifts • 8 Hours (Day & Evening)',
          shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h)',
        };
      }
    } else {
      // 3 Shifts
      if (hours === 12) {
        return {
          shiftCount: 3,
          shiftHours: 12,
          shiftType: '3 Shifts • 12 Hours (Overlapping 24x7)',
          shiftTimings: 'Shift 1: 06:00 AM - 06:00 PM (12h) | Shift 2: 02:00 PM - 02:00 AM (12h) | Shift 3: 10:00 PM - 10:00 AM (12h)',
        };
      } else if (hours === 6) {
        return {
          shiftCount: 3,
          shiftHours: 6,
          shiftType: '3 Shifts • 6 Hours (Rotational)',
          shiftTimings: 'Shift 1: 06:00 AM - 12:00 PM (6h) | Shift 2: 12:00 PM - 06:00 PM (6h) | Shift 3: 06:00 PM - 12:00 AM (6h)',
        };
      } else {
        return {
          shiftCount: 3,
          shiftHours: 8,
          shiftType: '3 Shifts • 8 Hours (24x7 Rotational)',
          shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
        };
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleShiftPreset = (count: number) => {
    const preset = calculateShiftPreset(count, formData.shiftHours);
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const handleShiftHoursChange = (hours: number) => {
    const preset = calculateShiftPreset(formData.shiftCount, hours);
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Company Name is required.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Admin Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const actionResult = await dispatch(
        createCompanyAsync({
          name: formData.name.trim(),
          adminName: formData.adminName.trim(),
          adminEmail: formData.adminEmail.trim().toLowerCase(),
          adminPhone: formData.adminPhone.trim(),
          password: formData.password.trim() || undefined,
          plan: formData.plan,
          status: 'Active',
          employeeCount: 1,
          maxEmployees: Number(formData.maxEmployees) || 100,
          location: formData.location || 'Mumbai, MH',
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          shiftCount: Number(formData.shiftCount) || 3,
          shiftType: formData.shiftType,
          shiftTimings: formData.shiftTimings,
        })
      );

      if (createCompanyAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        if (onRegisterSuccess) {
          onRegisterSuccess(actionResult.payload);
        }
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setFormData({
            name: '',
            adminName: '',
            adminEmail: '',
            adminPhone: '',
            password: '',
            location: '',
            plan: 'Growth',
            maxEmployees: 100,
            shiftCount: 3,
            shiftHours: 8,
            shiftType: '3 Shifts • 8 Hours (24x7 Rotational)',
            shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
          });
        }, 1200);
      } else if (createCompanyAsync.rejected.match(actionResult)) {
        setErrorMessage(
          (actionResult.payload as string) ||
            'Failed to register company on server.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Company"
      subtitle="Onboard a new organization to the Hazree Attendance Platform"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center py-8 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Company Registered Successfully!</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Organization <strong className="text-slate-800">{formData.name}</strong> has been saved to database.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              placeholder="Enter your company name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              required
            />
            <Input
              label="HQ Location"
              placeholder="Enter your headquarters location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* Primary Admin Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin Name"
              placeholder="Enter your admin name"
              value={formData.adminName}
              onChange={(e) => handleChange('adminName', e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Admin / Official Email *"
              type="email"
              placeholder="Enter your company email"
              value={formData.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Phone Number"
              placeholder="Enter your phone number"
              value={formData.adminPhone}
              onChange={(e) => handleChange('adminPhone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Subscription Plan Tier *
              </label>
              <select
                value={formData.plan}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = availablePlans.find((p) => p.name === val || p.code === val);
                  handleChange('plan', val);
                  if (found) {
                    handleChange('maxEmployees', found.max_employees || 100);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availablePlans.length > 0 ? (
                  availablePlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.currency}{p.price_amount} • Up to {p.max_employees} Staff)
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Trial">Free Trial (Up to 100 Staff)</option>
                    <option value="Growth">Growth Pro (Up to 150 Staff)</option>
                    <option value="Enterprise">Enterprise VIP (Up to 500 Staff)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Staff Limit (Quota)
            </label>
            <Input
              type="number"
              placeholder="Enter your employee limit"
              value={formData.maxEmployees}
              onChange={(e) => handleChange('maxEmployees', e.target.value)}
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          {/* Shift Configuration System */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Company Shift Configuration *
                </label>
                <p className="text-[11px] text-slate-500">
                  Kitne shifts me company chalegi aur har shift kitne ghante (8 hr, 12 hr, 9 hr) ki hogi
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {formData.shiftCount} {formData.shiftCount === 1 ? 'Shift' : 'Shifts'} • {formData.shiftHours} hrs
              </span>
            </div>

            {/* Shift Duration Dropdown */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Shift Working Hours / Duration *
              </label>
              <select
                value={formData.shiftHours}
                onChange={(e) => handleShiftHoursChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={8}>8 Hours Shift (8 hr)</option>
                <option value={12}>12 Hours Shift (12 hr)</option>
              </select>
            </div>

            {/* Shift Presets Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleShiftPreset(1)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  formData.shiftCount === 1
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                1 Shift
                <span className="block text-[10px] font-normal opacity-80">Day ({formData.shiftHours}h)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftPreset(2)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  formData.shiftCount === 2
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                2 Shifts
                <span className="block text-[10px] font-normal opacity-80">Day & Night ({formData.shiftHours}h)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftPreset(3)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  formData.shiftCount === 3
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                3 Shifts ⭐
                <span className="block text-[10px] font-normal opacity-80">24x7 ({formData.shiftHours}h)</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <Input
                label="Shift Title / Description"
                placeholder="e.g. 3 Shifts • 8 Hours (24x7 Rotational)"
                value={formData.shiftType}
                onChange={(e) => handleChange('shiftType', e.target.value)}
              />
              <Input
                label="Shift Timings Breakdown"
                placeholder="e.g. Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)"
                value={formData.shiftTimings}
                onChange={(e) => handleChange('shiftTimings', e.target.value)}
              />
            </div>
          </div>

          {/* Admin Login Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Initial Admin Login Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Used by company administrator to log into Company Portal.</p>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/companies/register"
              onClick={onClose}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center sm:justify-start gap-1 py-1"
            >
              Open Full Registration Page <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none justify-center">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1 sm:flex-none justify-center">
                Register Company
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
