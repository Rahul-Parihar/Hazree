'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Users,
  Clock,
  RotateCcw,
  Save,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchCompaniesAsync, updateCompanyAsync } from '../../../../redux/slices/companiesSlice';
import { subscriptionsService, BackendSubscriptionPlan } from '../../../../services';
import { Company, PlanType, CompanyStatus } from '../../../../types';

function EditCompanyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const userRole = useAppSelector((state) => state.auth.userRole);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const companies = useAppSelector((state) => state.companies.companies);

  const queryCompanyId = searchParams.get('id');

  // Determine target company: query param takes priority, else currentUser company
  const targetCompany =
    companies.find(
      (c) =>
        c.id === queryCompanyId ||
        c.id === `cmp_${queryCompanyId}` ||
        c.id === currentUser?.companyId ||
        c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
    ) || (companies.length > 0 && !currentUser?.companyId ? companies[0] : null);

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
    shiftHours: 8,
    shiftType: '3 Shifts • 8 Hours (24x7 Rotational)',
    shiftTimings: 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
    saturdayPolicy: 'ALL_WORKING',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    subscriptionsService
      .getPlans()
      .then((data) => {
        if (data && data.length > 0) {
          setAvailablePlans(data);
        }
      })
      .catch((err) => console.error(err));
  }, [dispatch]);

  useEffect(() => {
    if (targetCompany) {
      let detectedHours = 8;
      if (targetCompany.shiftType?.includes('12') || targetCompany.shiftTimings?.includes('12h') || targetCompany.shiftTimings?.includes('12 hrs')) {
        detectedHours = 12;
      } else if (targetCompany.shiftType?.includes('9') || targetCompany.shiftTimings?.includes('9 hrs')) {
        detectedHours = 9;
      } else if (targetCompany.shiftType?.includes('6') || targetCompany.shiftTimings?.includes('6h')) {
        detectedHours = 6;
      }

      setFormData({
        name: targetCompany.name || '',
        adminName: targetCompany.adminName || '',
        adminEmail: targetCompany.adminEmail || '',
        adminPhone: targetCompany.adminPhone || '',
        password: '',
        location: targetCompany.location || '',
        plan: targetCompany.plan || 'Growth',
        status: targetCompany.status || 'Active',
        maxEmployees: targetCompany.maxEmployees || 100,
        shiftCount: targetCompany.shiftCount || 3,
        shiftHours: detectedHours,
        shiftType: targetCompany.shiftType || '3 Shifts • 8 Hours (24x7 Rotational)',
        shiftTimings:
          targetCompany.shiftTimings ||
          'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
        saturdayPolicy: targetCompany.saturdayPolicy || 'ALL_WORKING',
      });
    }
  }, [targetCompany]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany) {
      setErrorMessage('No valid company selected to edit.');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('Company Name is required.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('New Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const actionResult = await dispatch(
        updateCompanyAsync({
          id: targetCompany.id,
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
            saturdayPolicy: formData.saturdayPolicy || 'ALL_WORKING',
          },
        })
      );

      if (updateCompanyAsync.fulfilled.match(actionResult)) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          if (userRole === 'SUPER_ADMIN') {
            router.push('/companies');
          } else {
            router.push('/');
          }
        }, 1200);
      } else if (updateCompanyAsync.rejected.match(actionResult)) {
        setErrorMessage((actionResult.payload as string) || 'Failed to update company on server.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update company.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={userRole === 'SUPER_ADMIN' ? '/companies' : '/'}
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600" />
              Edit Organization Profile & Shifts
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {targetCompany
                ? `Updating full profile, shifts, quota and subscription for ${targetCompany.name}`
                : 'Modify organization credentials, operating shifts, and parameters'}
            </p>
          </div>
        </div>

        <Link href={userRole === 'SUPER_ADMIN' ? '/companies' : '/'}>
          <Button variant="outline" size="sm">
            {userRole === 'SUPER_ADMIN' ? 'Back to Companies' : 'Back to Dashboard'}
          </Button>
        </Link>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Changes Saved Successfully!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Organization <strong className="text-slate-800">{formData.name}</strong> details, shifts, and credentials have been updated in the database.
          </p>
          <p className="text-xs text-emerald-600 font-semibold">Redirecting you back...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in"
        >
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Update Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section 1: Organization Profile */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Organization & Administrator Profile</h3>
                  <p className="text-xs text-slate-500">
                    Official organization identity, primary contact information and login credentials
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 hidden sm:block" />
            </div>

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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Organization Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as CompanyStatus)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Active">Active (Operational & Unlocked)</option>
                  <option value="Suspended">Suspended (Access Frozen)</option>
                  <option value="Pending">Pending Provisioning</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Operating Shift Configuration */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Operating Shifts Configuration</h3>
                  <p className="text-xs text-slate-500">
                    Kitne shifts me company chalegi aur har shift kitne ghante (8 hr, 12 hr, 9 hr) ki hogi
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                {formData.shiftCount} {formData.shiftCount === 1 ? 'Shift Schedule' : 'Shifts Schedule'} • {formData.shiftHours} hrs
              </span>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
              {/* Shift Hours / Duration Selector Dropdown */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Shift Working Hours / Duration (Per Shift) *</span>
                  <span className="text-amber-700 font-semibold lowercase">standard shift timing</span>
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

              {/* Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleShiftPreset(1)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
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
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
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
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
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
                    Morning, Eve & Night ({formData.shiftHours}h)
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Shift Description Title"
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

          {/* Section 3: Subscription & Capacity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Subscription Tier & Staff Capacity</h3>
                  <p className="text-xs text-slate-500">
                    Assign subscription plan and max employee seat limits
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  Staff Quota Limit
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
          </div>

          {/* Section 4: Security & Password Reset */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Security & Password Management</h3>
                  <p className="text-xs text-slate-500">
                    Reset admin login password (leave empty to keep current password unchanged)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  New Admin Login Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Auto-Generate
                </button>
              </div>

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
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <Link href={userRole === 'SUPER_ADMIN' ? '/companies' : '/'} className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto justify-center">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center"
            >
              Save All Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function EditCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading organization editor...</span>
        </div>
      }
    >
      <EditCompanyPageInner />
    </Suspense>
  );
}
