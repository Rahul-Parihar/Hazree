'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Company, PlanType, CompanyStatus } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { updateCompanyAsync } from '../../redux/slices/companiesSlice';
import { subscriptionsService, BackendSubscriptionPlan } from '../../services';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess?: (updatedCompany: Company) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  onSuccess,
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
    status: 'Active' as CompanyStatus,
    maxEmployees: 100,
    shiftCount: 3,
    shiftType: '3 Shifts (24x7 Rotational - Morning, Evening, Night)',
    shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM | Shift 2: 02:00 PM - 10:00 PM | Shift 3: 10:00 PM - 06:00 AM',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      subscriptionsService
        .getPlans()
        .then((data) => {
          if (data && data.length > 0) {
            setAvailablePlans(data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        name: company.name || '',
        adminName: company.adminName || '',
        adminEmail: company.adminEmail || '',
        adminPhone: company.adminPhone || '',
        password: '',
        location: company.location || '',
        plan: company.plan || 'Growth',
        status: company.status || 'Active',
        maxEmployees: company.maxEmployees || 100,
        shiftCount: company.shiftCount || 3,
        shiftType: company.shiftType || '3 Shifts (24x7 Rotational - Morning, Evening, Night)',
        shiftTimings: company.shiftTimings || 'Shift 1: 06:00 AM - 02:00 PM | Shift 2: 02:00 PM - 10:00 PM | Shift 3: 10:00 PM - 06:00 AM',
      });
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [company, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleShiftPreset = (count: number) => {
    if (count === 1) {
      setFormData((prev) => ({
        ...prev,
        shiftCount: 1,
        shiftType: '1 Shift (Day Shift)',
        shiftTimings: 'Shift 1 (Day): 09:00 AM - 06:00 PM (15m Grace)',
      }));
    } else if (count === 2) {
      setFormData((prev) => ({
        ...prev,
        shiftCount: 2,
        shiftType: '2 Shifts (Day & Night Operations)',
        shiftTimings: 'Shift 1: 08:00 AM - 04:00 PM | Shift 2: 04:00 PM - 12:00 AM',
      }));
    } else if (count === 3) {
      setFormData((prev) => ({
        ...prev,
        shiftCount: 3,
        shiftType: '3 Shifts (24x7 Rotational - Morning, Evening, Night)',
        shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM | Shift 2: 02:00 PM - 10:00 PM | Shift 3: 10:00 PM - 06:00 AM',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    if (!formData.name.trim()) {
      setErrorMessage('Company Name is required.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const actionResult = await dispatch(
        updateCompanyAsync({
          id: company.id,
          updates: {
            name: formData.name.trim(),
            adminName: formData.adminName.trim(),
            adminEmail: formData.adminEmail.trim().toLowerCase(),
            adminPhone: formData.adminPhone.trim(),
            password: formData.password.trim() || undefined,
            plan: formData.plan,
            status: formData.status,
            maxEmployees: Number(formData.maxEmployees) || 100,
            location: formData.location.trim() || 'Mumbai, MH',
            shiftCount: Number(formData.shiftCount) || 3,
            shiftType: formData.shiftType,
            shiftTimings: formData.shiftTimings,
          },
        })
      );

      if (updateCompanyAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(actionResult.payload);
        }
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1000);
      } else if (updateCompanyAsync.rejected.match(actionResult)) {
        setErrorMessage(
          (actionResult.payload as string) || 'Failed to update company details.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Company Details"
      subtitle={`Update organization info, shifts & subscription for ${company.name}`}
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
          <h4 className="text-xl font-bold text-slate-900">Changes Saved Successfully!</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Organization <strong className="text-slate-800">{formData.name}</strong> details have been updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              placeholder="e.g. Acme Technologies Pvt Ltd"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              icon={<Building2 className="w-4 h-4" />}
              required
            />
            <Input
              label="HQ Location"
              placeholder="e.g. Indore, MP"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* Primary Admin Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin Name"
              placeholder="e.g. Rajesh Sharma"
              value={formData.adminName}
              onChange={(e) => handleChange('adminName', e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Admin / Official Email *"
              type="email"
              placeholder="e.g. admin@company.com"
              value={formData.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={formData.adminPhone}
              onChange={(e) => handleChange('adminPhone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Organization Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as CompanyStatus)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Active">Active (Operational)</option>
                <option value="Suspended">Suspended (Locked)</option>
                <option value="Pending">Pending Setup</option>
              </select>
            </div>
          </div>

          {/* Plan & Staff Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Subscription Plan Tier
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff Limit (Quota)
              </label>
              <Input
                type="number"
                placeholder="Enter staff limit"
                value={formData.maxEmployees}
                onChange={(e) => handleChange('maxEmployees', e.target.value)}
                icon={<Users className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Shift Configuration System Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Operating Shift Configuration *
                </label>
                <p className="text-[11px] text-slate-500">
                  Select how many shifts this company operates in
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {formData.shiftCount} {formData.shiftCount === 1 ? 'Shift' : 'Shifts'}
              </span>
            </div>

            {/* Shift Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleShiftPreset(1)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  formData.shiftCount === 1
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                1 Shift
                <span className="block text-[10px] font-normal opacity-80">Day (09am-06pm)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftPreset(2)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  formData.shiftCount === 2
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                2 Shifts
                <span className="block text-[10px] font-normal opacity-80">Day & Night</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftPreset(3)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  formData.shiftCount === 3
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                3 Shifts ⭐
                <span className="block text-[10px] font-normal opacity-80">24x7 Rotational</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <Input
                label="Shift Title / Description"
                placeholder="e.g. 3 Shifts (Morning, Evening, Night / 24x7)"
                value={formData.shiftType}
                onChange={(e) => handleChange('shiftType', e.target.value)}
              />
              <Input
                label="Shift Timings Breakdown"
                placeholder="e.g. Shift 1: 06:00 AM - 02:00 PM | Shift 2: 02:00 PM - 10:00 PM | Shift 3: 10:00 PM - 06:00 AM"
                value={formData.shiftTimings}
                onChange={(e) => handleChange('shiftTimings', e.target.value)}
              />
            </div>
          </div>

          {/* Reset Admin Password (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reset Admin Password (Leave blank to keep unchanged)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter new password (optional)"
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
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
