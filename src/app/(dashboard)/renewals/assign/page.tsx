'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  CreditCard,
  Check,
  RefreshCw,
  Zap,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchCompaniesAsync } from '../../../../redux/slices/companiesSlice';
import { companiesService, subscriptionsService, BackendSubscriptionPlan } from '../../../../services';
import { Company, PlanType } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';

function AssignRenewalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);

  const queryCompanyId = searchParams.get('companyId');

  const [availablePlans, setAvailablePlans] = useState<BackendSubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedAssignPlan, setSelectedAssignPlan] = useState<string>('Growth Pro');
  const [customMaxEmployees, setCustomMaxEmployees] = useState<number>(150);
  const [renewalPeriod, setRenewalPeriod] = useState<string>('1_YEAR');
  const [customRenewalDate, setCustomRenewalDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch companies & live plans from database
  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    subscriptionsService
      .getPlans()
      .then((data) => {
        if (data && data.length > 0) {
          setAvailablePlans(data);
          setSelectedAssignPlan(data[0].name);
          setCustomMaxEmployees(data[0].max_employees || 100);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingPlans(false));
  }, [dispatch]);

  // Set initial selected company from query param or first available
  useEffect(() => {
    if (companies.length > 0) {
      if (queryCompanyId) {
        const found = companies.find((c) => c.id === queryCompanyId || c.id === `cmp_${queryCompanyId}`);
        if (found) {
          setSelectedCompanyId(found.id);
          setSelectedAssignPlan(found.plan);
          setCustomMaxEmployees(found.maxEmployees || 100);
          if (found.renewalDate) {
            setCustomRenewalDate(found.renewalDate);
          }
          return;
        }
      }
      if (!selectedCompanyId) {
        setSelectedCompanyId(companies[0].id);
        setSelectedAssignPlan(companies[0].plan);
        setCustomMaxEmployees(companies[0].maxEmployees || 100);
      }
    }
  }, [companies, queryCompanyId, selectedCompanyId]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const found = companies.find((c) => c.id === companyId);
    if (found) {
      setSelectedAssignPlan(found.plan);
      setCustomMaxEmployees(found.maxEmployees || 100);
      if (found.renewalDate) {
        setCustomRenewalDate(found.renewalDate);
      }
    }
  };

  const handlePlanSelect = (plan: BackendSubscriptionPlan) => {
    setSelectedAssignPlan(plan.name);
    setCustomMaxEmployees(plan.max_employees || 100);

    const d = new Date();
    if (plan.code === 'trial' || plan.name.toLowerCase().includes('trial')) {
      d.setDate(d.getDate() + 30);
      setRenewalPeriod('1_MONTH');
    } else {
      d.setFullYear(d.getFullYear() + 1);
      setRenewalPeriod('1_YEAR');
    }
    setCustomRenewalDate(d.toISOString().split('T')[0]);
  };

  const handleApplyRenewalPeriod = (period: string) => {
    setRenewalPeriod(period);
    const d = new Date();
    if (period === '1_MONTH') d.setMonth(d.getMonth() + 1);
    else if (period === '6_MONTHS') d.setMonth(d.getMonth() + 6);
    else if (period === '1_YEAR') d.setFullYear(d.getFullYear() + 1);
    else if (period === '2_YEARS') d.setFullYear(d.getFullYear() + 2);
    setCustomRenewalDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      setErrorMessage('Please select an organization.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const rawId = selectedCompanyId.replace('cmp_', '');
      await companiesService.updateCompany(rawId, {
        plan: selectedAssignPlan,
        max_employees: Number(customMaxEmployees) || 100,
        renewal_date: customRenewalDate,
        status: 'Active',
        is_active: true,
      });

      await dispatch(fetchCompaniesAsync());
      router.push('/renewals');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update subscription');
      setIsSubmitting(false);
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/renewals"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-emerald-600" />
              Assign or Renew Organization Subscription
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upgrade plan tier, extend renewal dates, and adjust employee limits
            </p>
          </div>
        </div>

        <Link href="/renewals">
          <Button variant="outline" size="sm">
            View All Renewals
          </Button>
        </Link>
      </div>

      {/* Main Full-Page Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 animate-fade-in"
      >
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Subscription Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Section 1: Target Organization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Target Organization
            </h3>
            {selectedCompany && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Current: {selectedCompany.plan} Plan ({selectedCompany.employeeCount}/{selectedCompany.maxEmployees} Staff)
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Organization *
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — ({c.plan} Plan • {c.employeeCount}/{c.maxEmployees} Staff • {c.adminEmail})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Choose Plan Tier */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              2. License Plan Tier
            </h3>
            <span className="text-xs text-slate-500">{availablePlans.length} Dynamic Tiers Available</span>
          </div>

          {isLoadingPlans ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Loading dynamic subscription plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availablePlans.map((p) => {
                const isSelected = selectedAssignPlan.toLowerCase() === p.name.toLowerCase();
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePlanSelect(p)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-500/10 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        Up to {p.max_employees} Staff
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-2">{p.name}</h4>
                      <div className="text-lg font-black text-slate-900 my-1">
                        {p.currency}{p.price_amount} <span className="text-xs font-semibold text-slate-500">/ {p.billing_cycle}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 line-clamp-2">
                      {p.tagline || 'Full tenant cloud license'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Allowed Employee Quota & Extension Duration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              3. Staff Quota &amp; Renewal Duration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Allowed Employee Quota *
              </label>
              <Input
                type="number"
                value={customMaxEmployees}
                onChange={(e) => setCustomMaxEmployees(Number(e.target.value))}
                icon={<Users className="w-4 h-4" />}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Maximum staff members this organization can enroll.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Quick Extension Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1_MONTH', label: '+1 Month' },
                  { id: '6_MONTHS', label: '+6 Months' },
                  { id: '1_YEAR', label: '+1 Year' },
                  { id: '2_YEARS', label: '+2 Years' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleApplyRenewalPeriod(item.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      renewalPeriod === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Renewal / Expiration Date *"
              type="date"
              value={customRenewalDate}
              onChange={(e) => {
                setCustomRenewalDate(e.target.value);
                setRenewalPeriod('CUSTOM');
              }}
              required
            />
          </div>
        </div>

        {/* Submit Actions Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link href="/renewals">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            Confirm &amp; Save Subscription
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AssignRenewalPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">Loading subscription renewal portal...</p>
        </div>
      }
    >
      <AssignRenewalPageInner />
    </Suspense>
  );
}
