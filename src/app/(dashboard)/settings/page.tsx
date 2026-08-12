'use client';

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Settings, MapPin, Shield, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Hazree System Settings</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Geofence GPS radiuses, AI face recognition thresholds, and notification webhooks
          </p>
        </div>

        <Button variant="primary" icon={<Save className="w-4 h-4" />}>
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPS Geofencing Configuration */}
        <Card title="Office Geofence & GPS Boundaries" subtitle="Configure geographic location radius for mobile punches">
          <div className="space-y-4">
            <Input label="Primary HQ Location Coordinates" defaultValue="19.0660° N, 72.8691° E (BKC Mumbai)" icon={<MapPin className="w-4 h-4" />} />
            <Input label="Allowed Geofence Radius (Meters)" defaultValue="150 meters" />
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
              ✓ Employees punching inside this 150m boundary will be automatically marked as <strong>Verified HQ Present</strong>.
            </div>
          </div>
        </Card>

        {/* AI Face Recognition Threshold */}
        <Card title="Facial Recognition Kiosk Parameters" subtitle="Camera biometric verification confidence score">
          <div className="space-y-4">
            <Input label="Face Liveness Match Threshold" defaultValue="98.5% Confidence Score" icon={<Shield className="w-4 h-4" />} />
            <Input label="Shift Grace Period (Minutes)" defaultValue="15 Minutes" />
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300">
              ✓ Punches within 15 minutes after 09:00 AM will not be flagged as late.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
