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
    shiftCount: 3,
    shiftHours: 8,
    shiftType: '3 Shifts • 8 Hours (24x7 Rotational)',
    shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
    saturdayPolicy: 'ALL_WORKING',
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
          shiftTimings: 'Shift 1 (Day): 08:00 AM - 08:00 PM (12 hrs)',
        };
      } else if (hours === 6) {
        return {
          shiftCount: 1,
          shiftHours: 6,
          shiftType: '1 Shift • 6 Hours (Part-time Shift)',
          shiftTimings: 'Shift 1 (Morning): 09:00 AM - 03:00 PM (6 hrs)',
        };
      } else {
        return {
          shiftCount: 1,
          shiftHours: 9,
          shiftType: '1 Shift • 9 Hours (Day Shift)',
          shiftTimings: 'Shift 1 (Day): 09:00 AM - 06:00 PM (9 hrs)',
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
          shiftCount: Number(formData.shiftCount) || 3,
          shiftType: formData.shiftType,
          shiftTimings: formData.shiftTimings,
          saturdayPolicy: formData.saturdayPolicy || 'ALL_WORKING',
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

            {/* Shift Configuration System Card */}
            <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Company Operating Shifts Configuration *
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure daily working shifts and shift duration (e.g. 8 hrs, 12 hrs, 6 hrs)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                    {formData.shiftCount} {formData.shiftCount === 1 ? 'Shift' : 'Shifts'} • {formData.shiftHours} hrs
                  </span>
                </div>
              </div>

              {/* Shift Hours / Duration Selector Dropdown */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Shift Working Hours / Duration (Per Shift) *</span>
                  <span className="text-emerald-600 font-semibold lowercase">standard shift timing</span>
                </label>
                <select
                  value={formData.shiftHours}
                  onChange={(e) => handleShiftHoursChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={8}>8 Hours Shift (8 hr)</option>
                  <option value={12}>12 Hours Shift (12 hr)</option>
                </select>
              </div>

              {/* Shift Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleShiftPreset(1)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.shiftCount === 1
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm">1 Shift (Day)</p>
                  <p className={`text-xs mt-1 ${formData.shiftCount === 1 ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Single Day {formData.shiftHours}h Shift
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleShiftPreset(2)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.shiftCount === 2
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm">2 Shifts</p>
                  <p className={`text-xs mt-1 ${formData.shiftCount === 2 ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Day & Night ({formData.shiftHours}h each)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleShiftPreset(3)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.shiftCount === 3
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm flex items-center justify-between">
                    <span>3 Shifts</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">24x7</span>
                  </p>
                  <p className={`text-xs mt-1 ${formData.shiftCount === 3 ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Morning, Evening & Night ({formData.shiftHours}h)
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Shift Description Tag"
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

            {/* Saturday & Weekend Policy Configuration Card */}
            <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Saturday & Weekend Off Policy *
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select organization weekend off schedule (Attendance matrix calculates working days dynamically)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('saturdayPolicy', 'ALL_WORKING')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.saturdayPolicy === 'ALL_WORKING'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm flex items-center justify-between">
                    <span>🏢 All Saturdays Working</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.saturdayPolicy === 'ALL_WORKING' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      6 Days / Week
                    </span>
                  </p>
                  <p className={`text-xs mt-1 ${formData.saturdayPolicy === 'ALL_WORKING' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    All Saturdays are active working days. Only Sundays are scheduled off.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('saturdayPolicy', 'SECOND_FOURTH_OFF')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.saturdayPolicy === 'SECOND_FOURTH_OFF'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm flex items-center justify-between">
                    <span>⚖️ 2nd & 4th Saturday Off</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.saturdayPolicy === 'SECOND_FOURTH_OFF' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      Corporate Standard
                    </span>
                  </p>
                  <p className={`text-xs mt-1 ${formData.saturdayPolicy === 'SECOND_FOURTH_OFF' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    2nd and 4th Saturdays are off. 1st, 3rd, and 5th Saturdays are working days.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('saturdayPolicy', 'ALL_OFF')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.saturdayPolicy === 'ALL_OFF'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm flex items-center justify-between">
                    <span>🌴 All Saturdays Off</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.saturdayPolicy === 'ALL_OFF' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      5 Days / Week
                    </span>
                  </p>
                  <p className={`text-xs mt-1 ${formData.saturdayPolicy === 'ALL_OFF' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Every Saturday and Sunday is scheduled off (5-day work week).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('saturdayPolicy', 'FIRST_THIRD_OFF')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    formData.saturdayPolicy === 'FIRST_THIRD_OFF'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold text-sm flex items-center justify-between">
                    <span>🔄 1st & 3rd Saturday Off</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.saturdayPolicy === 'FIRST_THIRD_OFF' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      Alternate Off
                    </span>
                  </p>
                  <p className={`text-xs mt-1 ${formData.saturdayPolicy === 'FIRST_THIRD_OFF' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    1st and 3rd Saturdays are off. 2nd, 4th, and 5th Saturdays are working days.
                  </p>
                </button>
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
