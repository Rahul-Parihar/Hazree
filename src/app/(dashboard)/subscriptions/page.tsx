'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  CreditCard,
  Plus,
  Sparkles,
  Zap,
  Crown,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ArrowRight,
  Check,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { createCompanyAsync, fetchCompaniesAsync } from '../../../redux/slices/companiesSlice';
import { subscriptionsService, companiesService, BackendSubscriptionPlan } from '../../../services';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

function SubscriptionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);

  const queryCompanyId = searchParams.get('companyId');
  const queryMode = searchParams.get('mode');

  const [pendingOnboarding, setPendingOnboarding] = useState<{
    name: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    password?: string;
    location: string;
    shiftCount?: number;
    shiftType?: string;
    shiftTimings?: string;
  } | null>(null);

  const targetCompany = queryCompanyId
    ? companies.find((c) => c.id === queryCompanyId || c.id === `cmp_${queryCompanyId}`)
    : null;

  const [plans, setPlans] = useState<BackendSubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isAssigningPlanId, setIsAssigningPlanId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quick Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<BackendSubscriptionPlan | null>(null);
  const [modalCompanyId, setModalCompanyId] = useState<string>('');
  const [modalMaxEmployees, setModalMaxEmployees] = useState<number>(100);
  const [modalRenewalDate, setModalRenewalDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmittingModalAssign, setIsSubmittingModalAssign] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pending_company_onboarding');
      if (stored) {
        try {
          setPendingOnboarding(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [queryMode]);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const data = await subscriptionsService.getPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Failed to load subscription plans:', err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
    fetchPlans();
  }, [dispatch]);

  // Handle plan card click
  const handleCardActionClick = (p: BackendSubscriptionPlan) => {
    if (pendingOnboarding || queryCompanyId) {
      handleDirectSelectPlan(p);
    } else {
      setSelectedPlanForAssign(p);
      setModalMaxEmployees(Number(p.max_employees) || 100);
      if (companies.length > 0) {
        setModalCompanyId(companies[0].id);
      }
      const d = new Date();
      if (p.code === 'trial' || p.name.toLowerCase().includes('trial')) {
        d.setDate(d.getDate() + 30);
      } else {
        d.setFullYear(d.getFullYear() + 1);
      }
      setModalRenewalDate(d.toISOString().split('T')[0]);
      setIsAssignModalOpen(true);
    }
  };

  const handleDirectSelectPlan = async (p: BackendSubscriptionPlan) => {
    setIsAssigningPlanId(p.id);

    const oneYearLater = new Date();
    if (p.code === 'trial' || p.name.toLowerCase().includes('trial')) {
      oneYearLater.setDate(oneYearLater.getDate() + 30);
    } else {
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    }
    const renewalDateStr = oneYearLater.toISOString().split('T')[0];

    try {
      if (pendingOnboarding) {
        const actionResult = await dispatch(
          createCompanyAsync({
            name: pendingOnboarding.name,
            adminName: pendingOnboarding.adminName,
            adminEmail: pendingOnboarding.adminEmail,
            adminPhone: pendingOnboarding.adminPhone,
            password: pendingOnboarding.password,
            location: pendingOnboarding.location,
            plan: p.name,
            status: 'Active',
            employeeCount: 1,
            maxEmployees: Number(p.max_employees) || 100,
            renewalDate: renewalDateStr,
            shiftCount: Number(pendingOnboarding.shiftCount) || 3,
            shiftType: pendingOnboarding.shiftType || '3 Shifts (24x7 Rotational - Morning, Evening, Night)',
            shiftTimings: pendingOnboarding.shiftTimings,
          })
        );

        if (createCompanyAsync.fulfilled.match(actionResult)) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pending_company_onboarding');
          }
          router.push('/companies');
        } else {
          alert((actionResult.payload as string) || 'Failed to register company');
          setIsAssigningPlanId(null);
        }
        return;
      }

      if (queryCompanyId) {
        const rawId = queryCompanyId.replace('cmp_', '');
        await companiesService.updateCompany(rawId, {
          plan: p.name,
          max_employees: Number(p.max_employees) || 100,
          renewal_date: renewalDateStr,
          status: 'Active',
          is_active: true,
        });

        await dispatch(fetchCompaniesAsync());
        router.push('/companies');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to apply subscription plan');
      setIsAssigningPlanId(null);
    }
  };

  const handleModalAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForAssign || !modalCompanyId) return;

    setIsSubmittingModalAssign(true);
    try {
      const rawId = modalCompanyId.replace('cmp_', '');
      await companiesService.updateCompany(rawId, {
        plan: selectedPlanForAssign.name,
        max_employees: Number(modalMaxEmployees) || 100,
        renewal_date: modalRenewalDate,
        status: 'Active',
        is_active: true,
      });

      await dispatch(fetchCompaniesAsync());
      setIsAssignModalOpen(false);
      router.push('/companies');
    } catch (err: any) {
      alert(err?.message || 'Failed to assign plan to selected organization');
    } finally {
      setIsSubmittingModalAssign(false);
    }
  };

  const handleDeletePlan = async (planId: number, planName: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;

    try {
      await subscriptionsService.deletePlan(planId);
      setFeedbackMessage(`Plan "${planName}" deleted successfully.`);
      fetchPlans();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete plan');
    }
  };

  const getThemeStyles = (theme?: string, isPopular?: boolean) => {
    const clr = theme || 'emerald';
    if (clr === 'indigo') {
      return {
        border: 'border-indigo-300 hover:border-indigo-400',
        gradient: 'from-indigo-50/70 via-purple-50/30 to-slate-50',
        badge: 'bg-indigo-600 text-white',
        priceText: 'text-indigo-950',
        check: 'text-indigo-600',
        btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      };
    }
    if (clr === 'purple') {
      return {
        border: 'border-purple-300 hover:border-purple-400',
        gradient: 'from-purple-50/70 via-pink-50/30 to-slate-50',
        badge: 'bg-purple-600 text-white',
        priceText: 'text-purple-950',
        check: 'text-purple-600',
        btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      };
    }
    if (clr === 'amber') {
      return {
        border: 'border-amber-300 hover:border-amber-400',
        gradient: 'from-amber-50/70 via-yellow-50/30 to-slate-50',
        badge: 'bg-amber-600 text-white',
        priceText: 'text-amber-950',
        check: 'text-amber-600',
        btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      };
    }
    if (clr === 'blue') {
      return {
        border: 'border-slate-200 hover:border-slate-300',
        gradient: 'from-slate-50 via-slate-100/50 to-slate-50',
        badge: 'bg-slate-800 text-white',
        priceText: 'text-slate-900',
        check: 'text-slate-700',
        btnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      };
    }
    return {
      border: isPopular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-200 hover:border-emerald-300',
      gradient: 'from-emerald-50/70 via-teal-50/30 to-slate-50',
      badge: 'bg-emerald-600 text-white',
      priceText: 'text-emerald-950',
      check: 'text-emerald-600',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Prominent Selection Banner when in onboarding flow or upgrading existing company */}
      {(pendingOnboarding || queryCompanyId) && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {pendingOnboarding ? 'Step 2: Finalize Organization Registration' : 'Change Plan Tier'}
              </span>
              <h3 className="text-xl font-black mt-1">
                Select a Plan for {pendingOnboarding ? `"${pendingOnboarding.name}"` : targetCompany ? `"${targetCompany.name}"` : 'Organization'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {pendingOnboarding
                  ? 'Choose any subscription plan below to register the organization account and activate instant tenant access.'
                  : 'Click "Select & Activate Plan" on any pricing tier below to update this company.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingOnboarding && (
              <Link href="/companies/register">
                <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white text-white hover:text-slate-900 border-white/30 text-xs">
                  Back to Details
                </Button>
              </Link>
            )}
            <Link href="/companies">
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white text-white hover:text-slate-900 border-white/30 text-xs">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      )}

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

      {/* Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Subscription Plans & Tier Catalog</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, customize, and manage subscription tiers, employee capacity limits, and pricing packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingPlans ? 'animate-spin' : ''}`} />}
            onClick={fetchPlans}
          >
            Refresh
          </Button>

          <Link href="/renewals">
            <Button variant="outline" size="sm" icon={<Building2 className="w-4 h-4" />}>
              Renewals
            </Button>
          </Link>

          <Link href="/subscriptions/create">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Plan Tier
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Plan Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Configured Subscription Plan Tiers</h3>
          <span className="text-xs text-slate-500">{plans.length} Live Tiers in Database</span>
        </div>

        {isLoadingPlans ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Loading subscription plans from database...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-600 mb-3">No subscription plans found in database.</p>
            <Link href="/subscriptions/create">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Create Your First Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {plans.map((p) => {
              const enrolledCount = companies.filter(
                (c) => c.plan.toLowerCase() === p.name.toLowerCase() || c.plan.toLowerCase() === p.code.toLowerCase()
              ).length;
              const theme = getThemeStyles(p.theme_color, p.is_popular);
              const isSelectedForTarget =
                targetCompany &&
                (targetCompany.plan.toLowerCase() === p.name.toLowerCase() ||
                  targetCompany.plan.toLowerCase() === p.code.toLowerCase());

              return (
                <div
                  key={p.id}
                  className={`relative p-6 rounded-3xl border bg-gradient-to-br ${theme.gradient} ${theme.border} shadow-sm flex flex-col justify-between transition-all hover:shadow-md`}
                >
                  {p.is_popular && (
                    <span className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] uppercase font-black px-3 py-0.5 rounded-full shadow-sm">
                      {p.badge_text || 'Most Popular'}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${theme.badge}`}>
                        Up to {p.max_employees} Staff
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                          {enrolledCount} {enrolledCount === 1 ? 'Company' : 'Companies'}
                        </span>
                        {p.code !== 'trial' && p.code !== 'growth' && p.code !== 'enterprise' && (
                          <button
                            type="button"
                            onClick={() => handleDeletePlan(p.id, p.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xl font-black text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.tagline || p.billing_cycle}</p>

                    <div className={`my-4 text-2xl font-black ${theme.priceText}`}>
                      {p.currency}
                      {p.price_amount} <span className="text-xs font-semibold text-slate-500">/ {p.billing_cycle}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                      {p.features && p.features.length > 0 ? (
                        p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${theme.check} shrink-0 mt-0.5`} />
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic">Standard Platform Access</li>
                      )}
                    </ul>
                  </div>

                  {/* Actions Footer: Always interactive and selectable */}
                  <div className="pt-6 mt-4 border-t border-slate-200/60 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className={`w-full text-xs font-bold ${theme.btnBg}`}
                      isLoading={isAssigningPlanId === p.id}
                      onClick={() => handleCardActionClick(p)}
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      {pendingOnboarding
                        ? `Activate ${p.name} & Complete Registration →`
                        : queryCompanyId
                        ? isSelectedForTarget
                          ? 'Keep Current Plan →'
                          : 'Select & Update Plan →'
                        : `Select / Assign Plan (${p.name}) →`}
                    </Button>

                    <Link href="/renewals">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/90 hover:bg-white text-xs"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Subscribed Orgs ({enrolledCount})
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Organization Plan Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={selectedPlanForAssign ? `Assign ${selectedPlanForAssign.name} Plan` : 'Assign Subscription Plan'}
        subtitle="Choose an organization to apply this subscription plan tier and employee quota"
      >
        <form onSubmit={handleModalAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Organization *
            </label>
            <select
              value={modalCompanyId}
              onChange={(e) => {
                setModalCompanyId(e.target.value);
                const found = companies.find((c) => c.id === e.target.value);
                if (found && selectedPlanForAssign) {
                  setModalMaxEmployees(selectedPlanForAssign.max_employees || found.maxEmployees);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.plan} Plan • {c.employeeCount}/{c.maxEmployees} Staff)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Selected Plan
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
                {selectedPlanForAssign?.name} ({selectedPlanForAssign?.currency}{selectedPlanForAssign?.price_amount})
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Allowed Staff Limit
              </label>
              <Input
                type="number"
                value={modalMaxEmployees}
                onChange={(e) => setModalMaxEmployees(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <Input
            label="Renewal / Expiration Date *"
            type="date"
            value={modalRenewalDate}
            onChange={(e) => setModalRenewalDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingModalAssign}>
              Confirm &amp; Apply Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">Loading subscription plans catalog...</p>
        </div>
      }
    >
      <SubscriptionsPageInner />
    </Suspense>
  );
}
