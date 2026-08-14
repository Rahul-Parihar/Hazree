'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Settings, MapPin, Shield, CheckCircle2, Save } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { updateSettings } from '../../../redux/slices/settingsSlice';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const [coords, setCoords] = useState(settings.geofenceCoordinates);
  const [radius, setRadius] = useState(settings.geofenceRadius);
  const [threshold, setThreshold] = useState(settings.faceLivenessThreshold);
  const [gracePeriod, setGracePeriod] = useState(settings.shiftGraceMinutes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    dispatch(
      updateSettings({
        geofenceCoordinates: coords,
        geofenceRadius: radius,
        faceLivenessThreshold: threshold,
        shiftGraceMinutes: gracePeriod,
      })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Hazree System Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geofence GPS radiuses, AI face recognition thresholds, and notification webhooks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved!
            </span>
          )}
          <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave} className="w-full sm:w-auto justify-center">
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPS Geofencing Configuration */}
        <Card title="Office Geofence & GPS Boundaries" subtitle="Configure geographic location radius for mobile punches">
          <div className="space-y-4">
            <Input
              label="Primary HQ Location Coordinates"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Allowed Geofence Radius (Meters)"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            />
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800">
              ✓ Employees punching inside this <strong>{radius}</strong> boundary will be automatically marked as <strong>Verified HQ Present</strong>.
            </div>
          </div>
        </Card>

        {/* AI Face Recognition Threshold */}
        <Card title="Facial Recognition Kiosk Parameters" subtitle="Camera biometric verification confidence score">
          <div className="space-y-4">
            <Input
              label="Face Liveness Match Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              icon={<Shield className="w-4 h-4" />}
            />
            <Input
              label="Shift Grace Period (Minutes)"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
            />
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/60 text-xs text-indigo-800">
              ✓ Punches within {gracePeriod} after 09:00 AM will not be flagged as late.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

