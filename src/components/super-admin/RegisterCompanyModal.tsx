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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/companies/register"
              onClick={onClose}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Open Full Registration Page <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Register Company
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
