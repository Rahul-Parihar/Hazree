'use client';

import React from 'react';
import { MapPin, Tablet, Smartphone, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CompanyKioskGeofenceStatus: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Geofence Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Office Geofence (Active)</h4>
              <p className="text-[11px] text-slate-500">BKC Office, Mumbai • Radius: 150m</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Live
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span>Punches inside boundary today:</span>
          <strong className="text-slate-900 font-mono">214 / 218 (98.1%)</strong>
        </div>
      </div>

      {/* Hardware Terminals & Device Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Tablet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Punch Terminals Status</h4>
              <p className="text-[11px] text-slate-500">2 Kiosks & Facial AI active</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            2/2 Online
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Mobile Face: <strong>68%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Tablet className="w-3.5 h-3.5 text-slate-400" /> Kiosk: <strong>24%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> Web: <strong>8%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
