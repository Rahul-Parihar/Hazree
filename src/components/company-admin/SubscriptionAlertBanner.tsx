'use client';

import React, { useState } from 'react';
import { AlertTriangle, Clock, CreditCard, Sparkles, X, ChevronRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Company } from '../../types';
import { Button } from '../ui/Button';

interface SubscriptionAlertBannerProps {
  company?: Company | null;
}

export const SubscriptionAlertBanner: React.FC<SubscriptionAlertBannerProps> = ({ company }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRenewSuccess, setIsRenewSuccess] = useState(false);

  if (!company || isDismissed) return null;

  // Calculate days remaining if not populated directly from backend
  let daysLeft = company.daysUntilRenewal;
  if (daysLeft === undefined && company.renewalDate) {
    const renewalTime = new Date(company.renewalDate).getTime();
    const nowTime = Date.now();
    daysLeft = Math.ceil((renewalTime - nowTime) / (1000 * 60 * 60 * 24));
  }

  const isExpired = company.isSubscriptionExpired ?? (daysLeft !== undefined && daysLeft < 0);
  const isExpiringSoon = company.isSubscriptionExpiringSoon ?? (daysLeft !== undefined && daysLeft >= 0 && daysLeft <= 5);

  // If subscription is healthy (> 5 days), don't show alert
  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  const formattedDate = company.renewalDate
    ? new Date(company.renewalDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Upcoming';

  const handleQuickRenew = () => {
    setIsRenewSuccess(true);
    setTimeout(() => {
      setIsRenewSuccess(false);
      setIsDismissed(true);
    }, 3000);
  };

  if (isRenewSuccess) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold">Renewal Request Submitted!</h4>
            <p className="text-xs text-emerald-700">
              Subscription renewal request has been sent to Super Admin for processing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 text-white shadow-lg shadow-rose-500/20 border border-rose-400/40 animate-pulse-slow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 ring-2 ring-white/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black tracking-tight">
                  Subscription Expired ({Math.abs(daysLeft ?? 1)} Days Overdue)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-rose-700 uppercase tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5 leading-relaxed">
                {company.subscriptionAlert ||
                  `Your ${company.plan} plan expired on ${formattedDate}. Please renew now to maintain uninterrupted employee punch log access.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              onClick={handleQuickRenew}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 text-xs font-black rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Renew Subscription
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expiring Soon (5 days or less)
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 border border-amber-400/40 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0 ring-2 ring-white/30">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black tracking-tight">
                ⚠️ Plan Expiring in {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 Day' : `${daysLeft} Days`} ({formattedDate})
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/30 backdrop-blur-sm text-white uppercase tracking-wider border border-white/40">
                5-Day Expiry Notice
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
              {company.subscriptionAlert ||
                `Your ${company.plan} subscription will expire on ${formattedDate}. Renew before expiration to avoid punch sync pauses.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleQuickRenew}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-black rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Renew Plan
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
