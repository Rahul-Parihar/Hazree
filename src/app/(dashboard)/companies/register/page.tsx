'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Layers,
  Users,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Crown,
  RefreshCw,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useAppDispatch } from '../../../../redux/hooks';
import { createCompanyAsync } from '../../../../redux/slices/companiesSlice';
import { companiesService } from '../../../../services';
import { PlanType } from '../../../../types';

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
    plan: 'Growth' as PlanType,
    maxEmployees: 100,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      } else if (createCompanyAsync.rejected.match(actionResult)) {
        setErrorMessage(
          (actionResult.payload as string) ||
            'Failed to register company on server.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      id: 'Trial' as PlanType,
      name: 'Free Trial',
      duration: '30 Days',
      price: 'Free',
      limit: 'Up to 25 Employees',
      features: ['Basic Attendance Log', 'Web Punch In/Out', 'Standard Support'],
      icon: Zap,
      accent: 'border-slate-200 hover:border-slate-400',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'Growth' as PlanType,
      name: 'Growth Pro',
      duration: 'Billed Yearly',
      price: '₹4,999 / mo',
      limit: 'Up to 150 Employees',
      features: [
        'Geo-fenced Punching',
        'Automated Leaves & Shifts',
        'Live Real-time Reports',
        'Priority 24/7 SLA Support',
      ],
      icon: Sparkles,
      recommended: true,
      accent: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'Enterprise' as PlanType,
      name: 'Enterprise VIP',
      duration: 'Billed Yearly',
      price: '₹14,999 / mo',
      limit: 'Unlimited Employees',
      features: [
        'Multi-Branch Multi-Tenant',
        'Custom Biometric Hardware Sync',
        'Dedicated Key Account Manager',
        'Custom SSO & Role Workflows',
      ],
      icon: Crown,
      accent: 'border-indigo-200 hover:border-indigo-400',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
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
              Super Admin Multi-Tenant Onboarding • Automatic Database Sync & Provisioning
            </p>
          </div>
        </div>

        <Link href="/companies">
          <Button variant="outline" size="sm">
            View All Companies
          </Button>
        </Link>
      </div>

      {isSuccess ? (
        /* Success State Card */
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xl shadow-emerald-500/5 p-10 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100/80 rounded-full flex items-center justify-center text-emerald-600 mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-12 h-12 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {formData.name} Registered Successfully!
            </h2>
            <p className="text-sm text-slate-600">
              Organization account has been provisioned on the PostgreSQL database.
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-slate-400 font-medium">Company Name:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{formData.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Active Plan:</span>
              <p className="font-bold text-indigo-600 text-sm mt-0.5">{formData.plan} Plan</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Primary Admin Email:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{formData.adminEmail || 'admin@hazree.com'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Headquarters:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{formData.location || 'India'}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
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
              }}
            >
              Register Another Company
            </Button>
            <Button variant="primary" onClick={() => router.push('/companies')}>
              Go to Organizations Directory
            </Button>
          </div>
        </div>
      ) : (
        /* Single Unified Registration Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Registration Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section: Organization & Admin Profile */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Organization & Administrator Details</h3>
                  <p className="text-xs text-slate-500">Legal entity information, official contact details & portal login credentials</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 hidden sm:block" />
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Company Name *"
                placeholder="Enter your company name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
                required
              />

              <Input
                label="Headquarters Location / City"
                placeholder="Enter your headquarters location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
              />

              <Input
                label="Official Contact Email *"
                type="email"
                placeholder="Enter your company email"
                value={formData.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Official Phone / Support"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.adminPhone}
                onChange={(e) => handleChange('adminPhone', e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Primary Admin Name"
                placeholder="Enter your admin name"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  Company Admin will use this password with their Official Email to log in.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Subscription Tier & Employee Quotas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Subscription Plan & License Quota</h3>
                  <p className="text-xs text-slate-500">Select license tier and maximum registered employee capacity</p>
                </div>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isSelected = formData.plan === p.id;
                const IconComponent = p.icon;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      handleChange('plan', p.id);
                      if (p.id === 'Trial') handleChange('maxEmployees', 25);
                      if (p.id === 'Growth') handleChange('maxEmployees', 150);
                      if (p.id === 'Enterprise') handleChange('maxEmployees', 1000);
                    }}
                    className={`cursor-pointer relative p-5 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-md shadow-emerald-500/5'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {p.recommended && (
                      <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                        Popular
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${p.badgeColor}`}>
                        {p.limit}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.duration}</p>

                    <div className="my-3 text-lg font-black text-slate-900">{p.price}</div>

                    <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Custom Max Employees */}
            <div className="max-w-xs pt-2">
              <Input
                label="Allowed Maximum Employee Capacity"
                type="number"
                placeholder="Enter your employee limit"
                value={formData.maxEmployees}
                onChange={(e) => handleChange('maxEmployees', e.target.value)}
                icon={<Users className="w-4 h-4" />}
                required
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <Link href="/companies">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<Building2 className="w-5 h-5" />}
            >
              Complete Company Registration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
