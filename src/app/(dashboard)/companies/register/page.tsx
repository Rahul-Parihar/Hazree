'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useAppDispatch } from '../../../../redux/hooks';
import { createCompanyAsync } from '../../../../redux/slices/companiesSlice';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredCompanyId, setRegisteredCompanyId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pwd = 'Haz@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Company Name is required.');
      return;
    }

    if (!formData.adminEmail.trim()) {
      setErrorMessage('Official Contact Email is required.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Admin Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Save pending company onboarding data in sessionStorage
      sessionStorage.setItem(
        'pending_company_onboarding',
        JSON.stringify({
          name: formData.name.trim(),
          adminName: formData.adminName.trim(),
          adminEmail: formData.adminEmail.trim().toLowerCase(),
          adminPhone: formData.adminPhone.trim(),
          password: formData.password.trim() || undefined,
          location: formData.location.trim() || 'Mumbai, Maharashtra',
        })
      );

      // Navigate to subscriptions catalog to select and finalize plan
      router.push('/subscriptions?mode=onboarding');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to proceed to subscription selection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/companies"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600" />
              Register New Organization
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin Multi-Tenant Onboarding • Provision organization details first, then choose subscription
            </p>
          </div>
        </div>

        <Link href="/companies">
          <Button variant="outline" size="sm">
            View All Companies
          </Button>
        </Link>
      </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in"
        >
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Registration Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section: Organization Profile */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Organization & Administrator Profile</h3>
                  <p className="text-xs text-slate-500">
                    Enter company information & admin login details. Subscription can be assigned next.
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 hidden sm:block" />
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Company Name *"
                placeholder="e.g. Acme Technologies Pvt Ltd"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
                required
              />

              <Input
                label="Headquarters Location / City"
                placeholder="e.g. Indore, Madhya Pradesh"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
              />

              <Input
                label="Official Contact Email *"
                type="email"
                placeholder="e.g. contact@acme.com"
                value={formData.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Official Phone / Support"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.adminPhone}
                onChange={(e) => handleChange('adminPhone', e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Primary Admin Full Name"
                placeholder="e.g. Rajesh Sharma"
                value={formData.adminName}
                onChange={(e) => handleChange('adminName', e.target.value)}
                icon={<User className="w-4 h-4" />}
              />

              {/* Admin Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Initial Admin Login Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter admin password"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  Company Admin will use this password with their Official Email to log into their portal.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <Link href="/companies" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto justify-center">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Continue to Assign Subscription →
            </Button>
          </div>
        </form>
    </div>
  );
}
