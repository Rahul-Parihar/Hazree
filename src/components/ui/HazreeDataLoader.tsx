'use client';

import React from 'react';
import { ShieldCheck, Clock, RefreshCw, Sparkles, Building2 } from 'lucide-react';

export type HazreeLoaderType =
  | 'table-skeleton'
  | 'card-skeleton'
  | 'pulse'
  | 'fullscreen'
  | 'inline-spinner';

interface HazreeDataLoaderProps {
  type?: HazreeLoaderType;
  message?: string;
  rows?: number;
  columns?: number;
  className?: string;
  subText?: string;
}

export const HazreeDataLoader: React.FC<HazreeDataLoaderProps> = ({
  type = 'table-skeleton',
  message = 'Loading data...',
  rows = 5,
  columns = 5,
  className = '',
  subText,
}) => {
  // 1. Table Shimmer Skeleton (Best for API Tables e.g. Employees, Attendance, Leaves, Companies)
  if (type === 'table-skeleton') {
    return (
      <div className={`w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in ${className}`}>
        {/* Table Header Skeleton */}
        <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-md animate-shimmer" />
            <div className="w-28 h-3.5 rounded-md animate-shimmer" />
          </div>
          <div className="w-20 h-3 rounded-md animate-shimmer" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="px-4 py-3.5 flex items-center justify-between gap-4 transition-colors"
            >
              {/* Left Column: Avatar + Title & Subtitle */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div
                    className="h-3.5 rounded-md animate-shimmer"
                    style={{ width: `${Math.floor(65 + (rIdx % 3) * 15)}%` }}
                  />
                  <div
                    className="h-2.5 rounded-md animate-shimmer opacity-70"
                    style={{ width: `${Math.floor(45 + (rIdx % 2) * 20)}%` }}
                  />
                </div>
              </div>

              {/* Middle Columns */}
              <div className="hidden sm:flex items-center gap-4 flex-1 justify-around">
                <div className="w-24 h-3 rounded-md animate-shimmer opacity-80" />
                <div className="w-20 h-3 rounded-md animate-shimmer opacity-80" />
                <div className="w-16 h-5 rounded-lg animate-shimmer" />
              </div>

              {/* Right Column: Status Badge & Action Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-6 rounded-full animate-shimmer" />
                <div className="w-8 h-8 rounded-lg animate-shimmer opacity-60" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer Skeleton */}
        <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="w-32 h-3 rounded-md animate-shimmer" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md animate-shimmer" />
            <div className="w-6 h-6 rounded-md animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Card Shimmer Skeleton (Best for KPI Metrics & Grid Cards)
  if (type === 'card-skeleton') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in ${className}`}>
        {Array.from({ length: 4 }).map((_, cIdx) => (
          <div
            key={cIdx}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5 overflow-hidden relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-3 rounded-md animate-shimmer" />
              <div className="w-8 h-8 rounded-xl animate-shimmer shrink-0" />
            </div>
            <div className="w-20 h-7 rounded-lg animate-shimmer" />
            <div className="w-32 h-2.5 rounded-md animate-shimmer opacity-70" />
          </div>
        ))}
      </div>
    );
  }

  // 3. Biometric Radar Pulse Loader (Best for Containers, Modals, Widgets)
  if (type === 'pulse') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm animate-fade-in ${className}`}
      >
        {/* Animated Glowing Rings Container */}
        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
          {/* Outer Ripple Wave 1 */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-radar-ripple" />
          {/* Outer Ripple Wave 2 */}
          <div
            className="absolute inset-0 rounded-full bg-emerald-500/15 animate-radar-ripple"
            style={{ animationDelay: '0.6s' }}
          />

          {/* Rotating Emerald Glowing Dual Ring */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-2.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" style={{ animationDuration: '1.2s' }} />

          {/* Center Glowing Icon */}
          <div className="relative z-10 w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Text Details */}
        <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <span>{message}</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
          </span>
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {subText || 'Synchronizing biometric attendance & live workforce logs'}
        </p>
      </div>
    );
  }

  // 4. Fullscreen Splash Loader (Best for Initial App Session Verification)
  if (type === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

        {/* Center Animated Logo Unit */}
        <div className="relative flex flex-col items-center gap-6 z-10">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-radar-ripple" />
            <div
              className="absolute inset-0 rounded-full bg-teal-400/15 animate-radar-ripple"
              style={{ animationDelay: '0.7s' }}
            />
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-2.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" style={{ animationDuration: '1.4s' }} />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-wider text-white">
                HAZREE<span className="text-emerald-400">.</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              {message || 'Verifying secure session & enterprise encryption...'}
            </p>
          </div>

          {/* Slim Neon Loading Bar */}
          <div className="w-48 h-1 rounded-full bg-slate-800 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Inline Mini Spinner (Best for Buttons & Micro tags)
  return (
    <div className={`inline-flex items-center gap-2 text-xs font-semibold text-slate-600 ${className}`}>
      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />
      <span>{message}</span>
    </div>
  );
};
