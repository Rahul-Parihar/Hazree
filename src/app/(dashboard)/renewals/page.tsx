'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  RefreshCw,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Users,
  CreditCard,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchCompaniesAsync } from '../../../redux/slices/companiesSlice';
import { companiesService, subscriptionsService, BackendSubscriptionPlan } from '../../../services';
import { Company, PlanType } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

function RenewalsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const isLoading = useAppSelector((state) => state.companies.isLoading);

  const [availablePlans, setAvailablePlans] = useState<BackendSubscriptionPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedAssignPlan, setSelectedAssignPlan] = useState<PlanType>('Growth');
  const [customMaxEmployees, setCustomMaxEmployees] = useState<number>(150);
  const [renewalPeriod, setRenewalPeriod] = useState<string>('1_YEAR');
  const [customRenewalDate, setCustomRenewalDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    subscriptionsService.getPlans().then((data) => {
      if (data && data.length > 0) {
        setAvailablePlans(data);
      }
    }).catch((err) => console.error(err));
  }, [dispatch]);

  // Handle Auto-Open parameter from company registration
  useEffect(() => {
    const queryCompanyId = searchParams.get('companyId');
    const autoOpen = searchParams.get('autoOpen');

    if (autoOpen === 'true') {
      if (queryCompanyId) {
        setSelectedCompanyId(queryCompanyId);
        const found = companies.find((c) => c.id === queryCompanyId || c.id === `cmp_${queryCompanyId}`);
        if (found) {
          setSelectedAssignPlan(found.plan);
          setCustomMaxEmployees(found.maxEmployees || 100);
        }
      } else if (companies.length > 0) {
        setSelectedCompanyId(companies[0].id);
      }
      setIsAssignModalOpen(true);
    }
  }, [searchParams, companies]);

  // Statistics
  const totalCompanies = companies.length;
  const expiringSoonCount = companies.filter((c) => {
    let days = c.daysUntilRenewal;
    if (days === undefined && c.renewalDate) {
      days = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
    return days !== undefined && days >= 0 && days <= 5;
  }).length;

  const expiredCount = companies.filter((c) => {
    let days = c.daysUntilRenewal;
    if (days === undefined && c.renewalDate) {
      days = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
    return days !== undefined && days < 0;
  }).length;

  const activeCount = totalCompanies - expiringSoonCount - expiredCount;

  // Filtered List
  const filteredCompanies = companies.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.adminEmail.toLowerCase().includes(query) ||
      c.adminName.toLowerCase().includes(query);

    const matchesPlan = planFilter === 'ALL' || c.plan.toUpperCase() === planFilter.toUpperCase();

    let matchesStatus = true;
    let days = c.daysUntilRenewal;
    if (days === undefined && c.renewalDate) {
      days = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    if (statusFilter === 'EXPIRING_SOON') {
      matchesStatus = days !== undefined && days >= 0 && days <= 5;
    } else if (statusFilter === 'EXPIRED') {
      matchesStatus = days !== undefined && days < 0;
    } else if (statusFilter === 'ACTIVE') {
      matchesStatus = (days === undefined || days > 5) && c.status === 'Active';
    }

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleOpenAssignModal = (company?: Company) => {
    if (company) {
      setSelectedCompanyId(company.id);
      setSelectedAssignPlan(company.plan);
      setCustomMaxEmployees(company.maxEmployees);
    } else if (companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
      setSelectedAssignPlan(companies[0].plan);
      setCustomMaxEmployees(companies[0].maxEmployees);
    }
    setIsAssignModalOpen(true);
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

  const handleSaveRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    setIsSubmittingRenewal(true);
    try {
      const rawId = selectedCompanyId.replace('cmp_', '');
      await companiesService.updateCompany(rawId, {
        plan: selectedAssignPlan,
        max_employees: Number(customMaxEmployees) || 100,
        renewal_date: customRenewalDate,
        status: 'Active',
        is_active: true,
      });

      // Refresh redux store
      await dispatch(fetchCompaniesAsync());

      setIsAssignModalOpen(false);
      router.push('/companies');
    } catch (err: any) {
      alert(err?.message || 'Failed to update subscription');
    } finally {
      setIsSubmittingRenewal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs font-bold text-emerald-700 hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Organization Subscriptions & Renewal Status</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live license renewals, capacity quotas, active plans, and 5-day expiration alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/subscriptions">
            <Button variant="outline" size="sm" icon={<CreditCard className="w-4 h-4" />}>
              Manage Plan Tiers
            </Button>
          </Link>

          <Link href="/renewals/assign">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Renew / Extend Subscription
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCompanies}</p>
          <p className="text-xs text-slate-400 mt-1">Active Subscribed Tenants</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Healthy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{activeCount}</p>
          <p className="text-xs text-emerald-600 mt-1">Valid & Active Licenses</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">5-Day Alert Notice</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{expiringSoonCount}</p>
          <p className="text-xs text-amber-600 mt-1">Expiring within 5 days</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Expired / Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-900 mt-2">{expiredCount}</p>
          <p className="text-xs text-rose-600 mt-1">Requires immediate renewal</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscribed company, admin, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Plans</option>
              {availablePlans.length > 0 ? (
                availablePlans.map((p) => (
                  <option key={p.id} value={p.name.toUpperCase()}>
                    {p.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="TRIAL">Trial</option>
                  <option value="GROWTH">Growth Pro</option>
                  <option value="ENTERPRISE">Enterprise VIP</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Expiry Status</option>
              <option value="EXPIRING_SOON">⚠️ Expiring within 5 Days</option>
              <option value="EXPIRED">❌ Expired Subscriptions</option>
              <option value="ACTIVE">✅ Active Healthy</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => dispatch(fetchCompaniesAsync())}
          >
            Refresh
          </Button>

          <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
            {filteredCompanies.length} of {companies.length}
          </div>
        </div>
      </div>

      {/* Subscriptions & Renewal Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Staff Quota</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Status & Countdown</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No matching organization subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  let daysLeft = c.daysUntilRenewal;
                  if (daysLeft === undefined && c.renewalDate) {
                    daysLeft = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  }

                  const isExpired = daysLeft !== undefined && daysLeft < 0;
                  const isExpiringSoon = daysLeft !== undefined && daysLeft >= 0 && daysLeft <= 5;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.adminEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={c.plan === 'Enterprise' ? 'enterprise' : c.plan === 'Growth' ? 'growth' : 'trial'}
                        >
                          {c.plan}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {c.employeeCount} / {c.maxEmployees} Enrolled
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {c.renewalDate ? new Date(c.renewalDate).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Expired ({Math.abs(daysLeft!)}d ago)
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Expiring in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active ({daysLeft ?? 365}d left)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/renewals/assign?companyId=${c.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Sparkles className="w-3.5 h-3.5" />}
                          >
                            Renew / Change
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign / Renew Subscription Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign or Renew Organization Subscription"
        subtitle="Upgrade plan tier, extend renewal dates, and adjust employee limits"
      >
        <form onSubmit={handleSaveRenewal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Organization *
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                const cmpId = e.target.value;
                setSelectedCompanyId(cmpId);
                const found = companies.find((c) => c.id === cmpId);
                if (found) {
                  setSelectedAssignPlan(found.plan);
                  setCustomMaxEmployees(found.maxEmployees);
                }
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.plan} Plan)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                License Plan Tier
              </label>
              <select
                value={selectedAssignPlan}
                onChange={(e) => {
                  const pName = e.target.value as PlanType;
                  setSelectedAssignPlan(pName);
                  const found = availablePlans.find((p) => p.name === pName || p.code === pName);
                  if (found) {
                    setCustomMaxEmployees(found.max_employees || 100);
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availablePlans.length > 0 ? (
                  availablePlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.currency}{p.price_amount} / {p.billing_cycle})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Trial">Free Trial (30 Days)</option>
                    <option value="Growth">Growth Pro (₹4,999/mo)</option>
                    <option value="Enterprise">Enterprise VIP (₹14,999/mo)</option>
                  </>
                )}
              </select>
            </div>

            <Input
              label="Allowed Employee Quota"
              type="number"
              value={customMaxEmployees}
              onChange={(e) => setCustomMaxEmployees(Number(e.target.value))}
              required
            />
          </div>

          {/* Quick Extension Period */}
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
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingRenewal}>
              Confirm & Save Subscription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function RenewalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">Loading subscription renewal portal...</p>
        </div>
      }
    >
      <RenewalsPageInner />
    </Suspense>
  );
}
