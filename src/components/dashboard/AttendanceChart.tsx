'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Clock, CalendarX, AlertCircle } from 'lucide-react';

export const AttendanceChart: React.FC = () => {
  const metrics = [
    { label: 'On Time Present', count: 123, color: 'bg-emerald-500', percent: 83 },
    { label: 'Late Punch In', count: 9, color: 'bg-amber-500', percent: 6 },
    { label: 'Approved Leave', count: 4, color: 'bg-indigo-500', percent: 3 },
    { label: 'Unexcused Absent', count: 3, color: 'bg-rose-500', percent: 2 },
    { label: 'Half Day Shift', count: 9, color: 'bg-sky-500', percent: 6 },
  ];

  const hourlyTrends = [
    { hour: '08:00 AM', punches: 12 },
    { hour: '08:30 AM', punches: 45 },
    { hour: '09:00 AM', punches: 68 },
    { hour: '09:30 AM', punches: 15 },
    { hour: '10:00 AM', punches: 4 },
  ];

  const maxPunches = Math.max(...hourlyTrends.map((h) => h.punches));

  return (
    <Card title="Today's Attendance Breakdown" subtitle="Live attendance metrics & punch timing activity distribution">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress distribution bar */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex h-4 w-full rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`${m.color} h-full transition-all rounded-sm`}
                style={{ width: `${m.percent}%` }}
                title={`${m.label}: ${m.count}`}
              />
            ))}
          </div>

          {/* Breakdown legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{m.label}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{m.count}</span>
                  <span className="text-xs text-slate-500 font-medium">{m.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Punch Arrival Trend */}
        <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Peak Arrival Times (Check-in Traffic)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Highest check-in activity logged around <strong>09:00 AM IST</strong>.
            </p>
          </div>

          <div className="flex items-end justify-between gap-2 pt-6 h-28">
            {hourlyTrends.map((h, idx) => {
              const heightPercent = Math.round((h.punches / maxPunches) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{h.punches}</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all hover:opacity-90"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{h.hour.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
