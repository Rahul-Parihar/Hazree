"use client";

import React, { useState } from "react";
import {
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Building,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { PRICING_PLANS } from "../../lib/mockData";
import { formatCurrencyINR } from "../../lib/utils";

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [employeeCount, setEmployeeCount] = useState<number>(35);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const totalLeakagePrevented = employeeCount * 750;
  const hrHoursSaved = Math.round(employeeCount * 0.45);
  const hrCostSaved = hrHoursSaved * 400;
  const totalMonthlySavings = totalLeakagePrevented + hrCostSaved;

  const planCost =
    employeeCount <= 10
      ? 0
      : employeeCount * (billingCycle === "yearly" ? 39 : 49);
  const netMonthlyGain = totalMonthlySavings - planCost;
  const roiMultiplier =
    planCost > 0 ? (totalMonthlySavings / planCost).toFixed(1) : "Infinite";

  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent & Scalable Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plans that grow with your organization.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Start completely free for up to 10 employees. Upgrade seamlessly as your
            team expands.
          </p>

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span
              className={`text-xs font-medium ${
                billingCycle === "monthly" ? "text-white" : "text-slate-400"
              }`}
            >
              Monthly Billing
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
              }
              className="w-12 h-6 rounded-full bg-slate-800 p-1 transition-colors relative border border-white/10"
            >
              <div
                className={`w-4 h-4 rounded-full bg-emerald-400 transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                billingCycle === "yearly" ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Interactive ROI Calculator Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Live Attendance ROI Calculator
                </h3>
                <p className="text-xs text-slate-400">
                  See how much money and hours Hazree saves your business every month
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-mono">
                {roiMultiplier}x ROI Return
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-semibold text-slate-300">
                Your Organization Headcount:
              </label>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {employeeCount} Employees
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 Staff</span>
              <span>50 Staff</span>
              <span>100 Staff</span>
              <span>250+ Staff</span>
            </div>
          </div>

          {/* ROI Metric Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
              <p className="text-xs text-slate-400">Leakage & Proxy Prevented</p>
              <p className="text-xl font-bold font-mono text-white">
                {formatCurrencyINR(totalLeakagePrevented)}/mo
              </p>
              <p className="text-[10px] text-slate-400">Eliminating ghost punches</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
              <p className="text-xs text-slate-400">HR Admin Time Saved</p>
              <p className="text-xl font-bold font-mono text-cyan-400">
                {hrHoursSaved} Hours/mo
              </p>
              <p className="text-[10px] text-slate-400">Automated payroll & registers</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <p className="text-xs text-emerald-400 font-semibold">Net Business Benefit</p>
              <p className="text-xl font-black font-mono text-emerald-300">
                +{formatCurrencyINR(netMonthlyGain)}/mo
              </p>
              <p className="text-[10px] text-slate-300">
                Subscription Cost: {formatCurrencyINR(planCost)}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => {
            const isGrowth = plan.id === "growth";
            const price =
              plan.pricePerEmpMonthly === 0
                ? "₹0"
                : billingCycle === "yearly"
                ? `₹${plan.pricePerEmpMonthly - 10}`
                : `₹${plan.pricePerEmpMonthly}`;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isGrowth
                    ? "bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105"
                    : "bg-slate-900/60 border border-white/10 hover:border-white/20"
                }`}
              >
                {isGrowth && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-emerald-500/30">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">
                      {price}
                    </span>
                    <span className="text-xs text-slate-400">
                      {plan.pricePerEmpMonthly === 0 ? "forever" : "/emp/month"}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Included Capabilities:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-300"
                        >
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-white/5">
                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      isGrowth
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    {plan.recommendedFor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
