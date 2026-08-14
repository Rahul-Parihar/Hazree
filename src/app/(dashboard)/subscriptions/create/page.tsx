'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Plus,
  X,
  ShieldCheck,
  Check,
  Crown,
  Zap,
  Eye,
  DollarSign,
  Users,
  Layers,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { subscriptionsService } from '../../../../services';

const DEFAULT_FEATURE_SUGGESTIONS = [
  'Geo-fenced Mobile GPS Punching',
  'Facial Recognition & Biometric Hardware Sync',
  'Automated Shift Rosters & Overtime Tracking',
  'Multi-tier Leave Approvals & Custom Policies',
  'Live Attendance PDF & Excel Automated Export',
  'Multi-Branch & Multi-Tenant Support',
  'Role-Based Granular Access Control',
  'Custom Payroll API & Webhook Integrations',
  'Dedicated Account Manager & 24/7 SLA Support',
];

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();

  // Form State
  const [planName, setPlanName] = useState('');
  const [tagline, setTagline] = useState('');
  const [badgeText, setBadgeText] = useState('Most Popular');
  const [priceAmount, setPriceAmount] = useState('4999');
  const [currency, setCurrency] = useState('₹');
  const [billingCycle, setBillingCycle] = useState('Billed Yearly');
  const [maxEmployees, setMaxEmployees] = useState<number>(150);
  const [isPopular, setIsPopular] = useState(true);
  const [themeColor, setThemeColor] = useState<'emerald' | 'indigo' | 'purple' | 'amber' | 'blue'>('emerald');

  // Features List
  const [features, setFeatures] = useState<string[]>([
    'Geo-fenced Mobile GPS Punching',
    'Automated Shift Rosters & Overtime Tracking',
    'Live Attendance PDF & Excel Automated Export',
    'Multi-tier Leave Approvals & Custom Policies',
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFeature = () => {
    if (customFeatureInput.trim() && !features.includes(customFeatureInput.trim())) {
      setFeatures((prev) => [...prev, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  const handleToggleSuggestion = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures((prev) => prev.filter((f) => f !== feat));
    } else {
      setFeatures((prev) => [...prev, feat]);
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      alert('Please enter a valid plan tier name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await subscriptionsService.createPlan({
        name: planName.trim(),
        tagline: tagline.trim() || undefined,
        badge_text: badgeText.trim() || undefined,
        price_amount: priceAmount.trim() || '0',
        currency,
        billing_cycle: billingCycle,
        max_employees: Number(maxEmployees) || 100,
        is_popular: isPopular,
        theme_color: themeColor,
        features: features,
      });

      router.push('/subscriptions');
    } catch (err: any) {
      alert(err?.message || 'Failed to create subscription plan');
      setIsSubmitting(false);
    }
  };

  // Color mappings for live preview
  const colorThemes = {
    emerald: {
      border: 'border-emerald-500 ring-2 ring-emerald-500/20',
      gradient: 'from-emerald-50/70 via-teal-50/40 to-slate-50',
      badge: 'bg-emerald-600 text-white',
      priceText: 'text-emerald-950',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      checkIcon: 'text-emerald-600',
    },
    indigo: {
      border: 'border-indigo-500 ring-2 ring-indigo-500/20',
      gradient: 'from-indigo-50/70 via-purple-50/40 to-slate-50',
      badge: 'bg-indigo-600 text-white',
      priceText: 'text-indigo-950',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      checkIcon: 'text-indigo-600',
    },
    purple: {
      border: 'border-purple-500 ring-2 ring-purple-500/20',
      gradient: 'from-purple-50/70 via-pink-50/40 to-slate-50',
      badge: 'bg-purple-600 text-white',
      priceText: 'text-purple-950',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      checkIcon: 'text-purple-600',
    },
    amber: {
      border: 'border-amber-500 ring-2 ring-amber-500/20',
      gradient: 'from-amber-50/70 via-yellow-50/40 to-slate-50',
      badge: 'bg-amber-600 text-white',
      priceText: 'text-amber-950',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      checkIcon: 'text-amber-600',
    },
    blue: {
      border: 'border-blue-500 ring-2 ring-blue-500/20',
      gradient: 'from-blue-50/70 via-cyan-50/40 to-slate-50',
      badge: 'bg-blue-600 text-white',
      priceText: 'text-blue-950',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      checkIcon: 'text-blue-600',
    },
  };

  const currentTheme = colorThemes[themeColor];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header with Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/subscriptions"
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Back to Subscription Plans"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Create New Subscription Plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the plan details, pricing tiers, staff limits, and feature entitlements in the unified form below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/subscriptions">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Single Unified Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Unified Single Form Container */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-8"
          >
            {/* PART 1: Plan Identity & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Plan Identity & Description</h3>
                  <p className="text-xs text-slate-500">Set the customer-facing name, badge, and positioning</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Plan Tier Name *"
                  placeholder="e.g. Growth Pro, Scale Plus, VIP Enterprise"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                />

                <Input
                  label="Badge / Highlight Tag"
                  placeholder="e.g. Most Popular, Best Value, 20% Off"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                />
              </div>

              <Input
                label="Short Description / Tagline"
                placeholder="e.g. Tailored for expanding organizations with multi-branch shift rosters"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />

              <div className="pt-1">
                <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Mark as "Most Popular" Recommended Plan
                </label>
              </div>
            </div>

            {/* PART 2: Pricing & Capacity Quota */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Pricing & Capacity Quota</h3>
                  <p className="text-xs text-slate-500">Define employee limits and recurring billing schedule</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Price Amount *"
                  placeholder="4999"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Currency Symbol
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="₹">₹ (INR - Rupee)</option>
                    <option value="$">$ (USD - Dollar)</option>
                    <option value="€">€ (EUR - Euro)</option>
                    <option value="£">£ (GBP - Pound)</option>
                    <option value="AED">AED (Dirham)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Billed Monthly">Billed Monthly</option>
                    <option value="Billed Yearly">Billed Yearly</option>
                    <option value="Billed Quarterly">Billed Quarterly</option>
                    <option value="One-Time / Lifetime">One-Time / Lifetime</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Max Allowed Employee Quota *"
                  type="number"
                  placeholder="150"
                  value={maxEmployees}
                  onChange={(e) => setMaxEmployees(Number(e.target.value))}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Card Accent Theme Color
                  </label>
                  <div className="flex items-center gap-2.5 pt-1.5">
                    {(['emerald', 'indigo', 'purple', 'amber', 'blue'] as const).map((clr) => (
                      <button
                        type="button"
                        key={clr}
                        onClick={() => setThemeColor(clr)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          themeColor === clr ? 'scale-110 ring-2 ring-slate-900' : 'opacity-70 hover:opacity-100'
                        } ${
                          clr === 'emerald'
                            ? 'bg-emerald-500 border-emerald-600'
                            : clr === 'indigo'
                            ? 'bg-indigo-500 border-indigo-600'
                            : clr === 'purple'
                            ? 'bg-purple-500 border-purple-600'
                            : clr === 'amber'
                            ? 'bg-amber-500 border-amber-600'
                            : 'bg-blue-500 border-blue-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PART 3: Feature Entitlements List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Feature Entitlements List</h3>
                  <p className="text-xs text-slate-500">Check standard features or add custom bullet points</p>
                </div>
              </div>

              {/* Custom Feature Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a custom feature (e.g. 24/7 Dedicated Phone Support)..."
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Button type="button" size="sm" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Quick Feature Suggestions Chips */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Suggested Platform Modules:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_FEATURE_SUGGESTIONS.map((feat, idx) => {
                    const isSelected = features.includes(feat);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleToggleSuggestion(feat)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {feat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Enrolled Features List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Enrolled Plan Features ({features.length}):
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Link href="/subscriptions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                <CheckCircle2 className="w-4 h-4" />
                Publish & Save Plan Tier
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Card Preview (4 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-indigo-600" />
                Live Card Preview
              </div>
              <span className="text-[11px] text-slate-400 font-medium">As seen by organizations</span>
            </div>

            {/* Rendered Preview Card */}
            <div
              className={`relative p-6 rounded-3xl border bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.border} shadow-lg flex flex-col justify-between transition-all`}
            >
              {isPopular && (
                <span className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] uppercase font-black px-3 py-0.5 rounded-full shadow-sm">
                  {badgeText || 'Most Popular'}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${currentTheme.badge}`}>
                    Up to {maxEmployees} Employees
                  </span>
                  {badgeText && !isPopular && (
                    <span className="text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {badgeText}
                    </span>
                  )}
                </div>

                <h4 className="text-2xl font-black text-slate-900">{planName || 'Plan Name Here'}</h4>
                <p className="text-xs text-slate-500 mt-1">{tagline || billingCycle}</p>

                <div className={`my-5 text-3xl font-black ${currentTheme.priceText}`}>
                  {currency}
                  {priceAmount || '0'} <span className="text-xs font-semibold text-slate-500">/ mo</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-200/60">
                  {features.length === 0 ? (
                    <li className="text-slate-400 italic">No features added yet.</li>
                  ) : (
                    features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${currentTheme.checkIcon} shrink-0 mt-0.5`} />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/60">
                <button
                  type="button"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition-all text-center ${currentTheme.btn}`}
                >
                  Select {planName || 'Plan'}
                </button>
              </div>
            </div>

            {/* Quota Highlights Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Backend Quota Enforcement
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                When an organization enrolls in this tier, the backend restricts employee creation past the{' '}
                <strong className="text-white">{maxEmployees} staff limit</strong> and schedules automatic 5-day expiration notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
