'use client';

import React from 'react';
import {
  MapPin,
  Tablet,
  Smartphone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const CompanyKioskGeofenceStatus: React.FC = () => {
  // Device & Terminal punch distribution data
  const terminalData = [
    { name: 'Mobile Face AI', value: 68, count: 148, color: '#10b981' },
    { name: 'Kiosk Terminal', value: 24, count: 52, color: '#3b82f6' },
    { name: 'Web / Portal', value: 8, count: 18, color: '#f59e0b' },
  ];

  // Geofence hourly punch distribution data
  const geofenceHourlyData = [
    { time: '08-10 AM', inside: 112, outside: 2 },
    { time: '10-12 PM', inside: 58, outside: 1 },
    { time: '12-02 PM', inside: 18, outside: 0 },
    { time: '02-04 PM', inside: 12, outside: 1 },
    { time: '04-06 PM', inside: 14, outside: 0 },
  ];

  const totalPunches = 218;
  const insidePunches = 214;
  const outsidePunches = 4;
  const complianceRate = 98.1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {/* 1. Geofence Status Card with Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Office Geofence (Active)</h4>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-xs text-slate-500">BKC Office, Mumbai • Radius: 150m</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {complianceRate}% Valid
          </span>
        </div>

        {/* Punch Compliance Stats Grid & Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-emerald-700 uppercase">Inside Boundary</p>
            <p className="text-base font-extrabold text-emerald-900 font-mono mt-0.5">{insidePunches}</p>
            <p className="text-[10px] text-emerald-600 font-medium">{complianceRate}%</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-amber-700 uppercase">Outside / Flagged</p>
            <p className="text-base font-extrabold text-amber-900 font-mono mt-0.5">{outsidePunches}</p>
            <p className="text-[10px] text-amber-600 font-medium">1.9%</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase">GPS Precision</p>
            <p className="text-base font-extrabold text-slate-900 font-mono mt-0.5">±8.2m</p>
            <p className="text-[10px] text-slate-500 font-medium">High Accuracy</p>
          </div>
        </div>

        {/* Geofence Hourly Bar Graph */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">Punches by Time Window:</span>
            <span className="text-[11px] text-slate-400">Total: {totalPunches} punches</span>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geofenceHourlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    padding: '6px 10px',
                  }}
                />
                <Bar dataKey="inside" name="Inside Boundary" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="outside" name="Outside Boundary" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Auto-validation via Geofence GPS Guard active
          </span>
          <span className="font-semibold text-slate-700">150m Office Perimeter</span>
        </div>
      </div>

      {/* 2. Hardware Terminals & Device Breakdown Card with Donut Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Punch Terminals & Device Breakdown</h4>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  2/2 Online
                </span>
              </div>
              <p className="text-xs text-slate-500">2 Kiosks & Mobile Facial AI Active</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Live Feed
          </span>
        </div>

        {/* Donut Chart + Breakdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut Chart */}
          <div className="relative w-[130px] h-[130px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={terminalData}
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {terminalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    padding: '6px 10px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-extrabold text-slate-900 leading-none">218</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Punches</span>
            </div>
          </div>

          {/* Breakdown progress bars */}
          <div className="flex-1 w-full space-y-2.5">
            {terminalData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    {item.name === 'Mobile Face AI' ? (
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    ) : item.name === 'Kiosk Terminal' ? (
                      <Tablet className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{item.name}</span>
                  </span>
                  <span className="font-mono text-slate-600 font-bold">
                    {item.value}% <span className="text-[10px] text-slate-400 font-normal">({item.count})</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminals Status pills */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-600 font-medium truncate">Reception Kiosk #1</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-600 font-medium truncate">Floor 2 Kiosk #2</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

